import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { IncomingForm } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { Engine } from "@thirdweb-dev/engine";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for Formidable
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Request received:", req.method);

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return; // Stop execution for invalid HTTP methods
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      res.status(500).json({ message: "Error parsing form data" });
      return;
    }

    const image = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;
    const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;

    if (!image || !address) {
      res.status(400).json({ message: "Missing image or address in the request" });
      return; // Stop execution if required data is missing
    }

    const {
      TW_ENGINE_URL,
      TW_ACCESS_TOKEN,
      TW_BACKENDWALLET,
      TW_CONTRACT_ADDRESS,
      TW_SECRETKEY,
    } = process.env;

    if (!TW_ENGINE_URL || !TW_ACCESS_TOKEN || !TW_BACKENDWALLET || !TW_CONTRACT_ADDRESS || !TW_SECRETKEY) {
      res.status(500).json({ message: "Missing environment variables" });
      return;
    }

    try {
      const fileData = fs.readFileSync(image.filepath);

      const storage = new ThirdwebStorage({
        secretKey: TW_SECRETKEY,
      });

      const uri = await storage.upload(fileData);

      const metaData = {
        name: "High Monkey NFT",
        description: "This is a high monkey NFT",
        image: uri,
        attributes: [
          { trait_type: "Background", value: fields.background || "Unknown" },
          { trait_type: "Top", value: fields.top || "Unknown" },
          { trait_type: "Fur", value: fields.fur || "Unknown" },
          { trait_type: "Skin", value: fields.skin || "Unknown" },
          { trait_type: "Mouth", value: fields.mouth || "Unknown" },
          { trait_type: "Glass", value: fields.glass || "Unknown" },
          { trait_type: "Jewel", value: fields.jewel || "Unknown" },
        ],
      };

      const engine = new Engine({
        url: TW_ENGINE_URL,
        accessToken: TW_ACCESS_TOKEN,
      });

      const response = await engine.erc721.mintTo(
        "sepolia",
        TW_CONTRACT_ADDRESS,
        TW_BACKENDWALLET,
        {
          receiver: address,
          metadata: metaData,
        }
      );

      res.status(200).json({ success: true, ipfsUri: uri, metaData });
      console.log("Response sent to frontend:", { ipfsUri: uri, metaData });
    } catch (error:any) {
      console.error("Error during minting:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
      }
    } finally {
      if (fs.existsSync(image.filepath)) {
        fs.unlinkSync(image.filepath);
      }
    }
  });
}
