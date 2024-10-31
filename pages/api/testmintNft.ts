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
  console.log('Request received:', req.method); // Log the request method

  if (req.method !== "POST") {
    console.warn('Invalid request method:', req.method); 
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    console.log('Parsed fields:', fields);
    console.log('Parsed files:', files);

    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }

    const image = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;
    const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;

    console.log('Image object:', image);
    console.log('Address:', address);

    if (!image || !address) {
      console.warn('Missing image or address in the request');
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const { 
      TW_ENGINE_URL, 
      TW_ACCESS_TOKEN, 
      TW_BACKENDWALLET, 
      TW_CONTRACT_ADDRESS, 
      TW_SECRETKEY 
    } = process.env;

    console.log('Environment variables loaded:', {
      TW_ENGINE_URL, 
      TW_ACCESS_TOKEN, 
      TW_BACKENDWALLET, 
      TW_CONTRACT_ADDRESS, 
      TW_SECRETKEY,
    });
    console.log('TW_ACCESS_TOKEN:', process.env.TW_ACCESS_TOKEN);

    if (!TW_ENGINE_URL || !TW_ACCESS_TOKEN || !TW_BACKENDWALLET || !TW_CONTRACT_ADDRESS || !TW_SECRETKEY) {
      console.error('Missing environment variables');
      res.status(500).json({ message: "Missing environment variables" });
      return;
    }

    try {
      console.log('Reading file from:', image.filepath);
      const fileData = fs.readFileSync(image.filepath);
      console.log('File read successfully. Size:', fileData.length);

      const storage = new ThirdwebStorage({
        secretKey: TW_SECRETKEY,
      });

      console.log('Uploading file to IPFS...');
      const uri = await storage.upload(fileData);
      console.log('File uploaded successfully. IPFS URI:', uri);

      const metaData = {
        name: "High Monkey NFT",
        description: "This is a high monkey NFT",
        image: uri,
      };

      console.log('Metadata:', metaData);

      const engine = new Engine({
        url: TW_ENGINE_URL,
        accessToken: TW_ACCESS_TOKEN,
      });
      console.log(TW_ACCESS_TOKEN)
      console.log('Minting NFT...');
      const response = await engine.erc721.mintTo(
        "sepolia",
        TW_CONTRACT_ADDRESS,
        TW_BACKENDWALLET,
        {
          receiver: address,
          metadata: metaData,
        }
      );

      console.log('Minting successful:', response);

      res.status(200).json(response);

      console.log('Cleaning up the uploaded file...');
      fs.unlinkSync(image.filepath);
      console.log('File cleanup successful.');
    } catch (error: any) {
      console.error('Error during minting:', error);

      if (fs.existsSync(image.filepath)) {
        console.log('Cleaning up the uploaded file after error...');
        fs.unlinkSync(image.filepath);
      }

      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  });
}
