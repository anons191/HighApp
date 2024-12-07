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
    return;
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      res.status(500).json({ message: "Error parsing form data" });
      return;
    }

    const getFieldValue = (field: any) => (Array.isArray(field) ? field[0] : field) || "Unknown";

    // Extract cleaned field values
    const image = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;
    const address = getFieldValue(fields.address);
    const background = getFieldValue(fields.background);
    const top = getFieldValue(fields.top);
    const fur = getFieldValue(fields.fur);
    const skin = getFieldValue(fields.skin);
    const mouth = getFieldValue(fields.mouth);
    const glass = getFieldValue(fields.glass);
    const extra = getFieldValue(fields.extra);

    if (!image || !address) {
      res.status(400).json({ message: "Missing image or address in the request" });
      return;
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
          { trait_type: "Background", value: background },
          { trait_type: "Top", value: top },
          { trait_type: "Fur", value: fur },
          { trait_type: "Skin", value: skin },
          { trait_type: "Mouth", value: mouth },
          { trait_type: "Glass", value: glass },
          { trait_type: "Extra", value: extra },
        ],
      };

      console.log("Constructed metadata:", metaData);

      const engine = new Engine({
        url: TW_ENGINE_URL,
        accessToken: TW_ACCESS_TOKEN,
      });

      const response = await engine.erc721.mintTo(
        "base",
        TW_CONTRACT_ADDRESS,
        TW_BACKENDWALLET,
        {
          receiver: address,
          metadata: metaData,
        }
      );

      res.status(200).json({ success: true, ipfsUri: uri, metaData });
      console.log("Response sent to frontend:", { ipfsUri: uri, metaData });
    } catch (error: any) {
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
