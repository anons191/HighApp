"use client";

import {
  ConnectButton,
  useActiveWallet,
  useSendAndConfirmTransaction,
} from "thirdweb/react"; // Import necessary hooks
import { client } from "./client";
import { sepolia } from "thirdweb/chains";
import { toWei } from "thirdweb/utils"; // Import utility to convert ETH to Wei
import { useEffect, useRef, useState } from "react";

// Attribute options for NFTs
const backgrounds = ["/images/BackgroundBeige.png", "/images/BackgroundGold.png","/images/BackgroundGrey.png"];
const tops = ["/images/HoodieBTC.png", "/images/HoodieLogo.png","/images/ShirtHawaiian.png","/images/SuitPurple.png"]; //top
const furs = ["/images/FurBlue.png","/images/FurGold2.png","/images/FurRed.png","/images/FurGreen.png"]; 
const skins = ["/images/HODL GREEN.png","/images/SkinGold.png","/images/SkinNatural.png","/images/SkinZombie.png",]; // skin
const mouths = ["/images/MouthBlunt.png","/images/MouthGoldGrill.png","/images/MouthTongue.png",""]; // mouth
const glasses =["/images/Eyepatch.png","/images/Glasses3D.png","/images/GlassesAviator.png","/images/GlassesHeart.png","/images/GlassesPurpleRound.png","/images/GlassesYeezy.png",]// glasses
const jewelry = ["/images/GMZombie.png","/images/GoldGM.png","/images/GoldHoopEarring.png"]// jewlery

// Wallet address to receive minting fees
const WALLET_ADDRESS = "0x575A9960be5f23C8E8aF7F9C8712A539eB255bE6";

export default function Home() {
  const wallet = useActiveWallet(); // Access the active wallet
  const [isNftMinting, setNftMinting] = useState<boolean>(false); // State to track minting status
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Canvas reference

  // State for NFT attributes
  const [background, setBackground] = useState<string>("");
  const [top, setTop] = useState<string>("");
  const [fur, setFur] = useState<string>("");
  const [skin, setSkin] = useState<string>("");
  const [mouth, setMouth] = useState<string>("");
  const [glass, setGlass] = useState<string>("");
  const [jewel, setJewel] = useState<string>("");
  // Hook for sending and confirming ETH transactions
  const { mutate: sendAndConfirmTx } = useSendAndConfirmTransaction();

  // Effect to update the canvas with selected attributes
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (background && top && fur && skin && mouth && glass && jewel && ctx) {
      const images = [background, top, fur, skin, mouth, glass, jewel].map(
        (src) => {
          const img = new Image();
          img.src = src;
          return img;
        }
      );

      images[0].onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        images.forEach((img) => ctx.drawImage(img, 0, 0, canvas.width, canvas.height));
      };
    }
  }, [background, top, fur, skin, mouth, glass, jewel]);

  // Convert the canvas content to a blob and initiate the minting process
  const convertCanvasToBlob = async () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(async (blob) => {
      if (blob) {
        await handleMint(blob); // Trigger the minting process
      }
    });
  };

  // Retrieve the wallet address and send the NFT mint request
  const sendNftMintRequest = async (blob: Blob) => {
    let address = "";

    try {
      const account = wallet?.getAccount(); // Call getAccount() to retrieve the account
      address = account?.address || ""; // Extract the address
    } catch (error) {
      console.error("Failed to get wallet address:", error);
      alert("Unable to retrieve wallet address. Please try reconnecting.");
      return; // Exit if the address retrieval fails
    }

    const formData = new FormData();
    formData.append("image", blob, "nft.png");
    formData.append("address", address); // Append the address to the form data

    setNftMinting(true); // Set minting status to true

    try {
      const response = await fetch("/api/mintNft", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unexpected error occurred");

      alert("NFT minted successfully!");
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed. Please try again.");
    } finally {
      setNftMinting(false); // Reset minting status
    }
  };

  // Handle the ETH payment and call the mint function on success
  const handleMint = async (blob: Blob) => {
    const paymentInWei = toWei("0.0001"); // Convert 0.0001 ETH to Wei

    const tx = {
      to: WALLET_ADDRESS, // Wallet to receive the fee
      value: paymentInWei, // Amount in Wei
      chain: sepolia, // Sepolia blockchain
      client: client, // Thirdweb client
    };

    try {
      // Send the payment and confirm it
      await sendAndConfirmTx(tx);
      console.log("Payment confirmed!");

      // Proceed to send the NFT mint request to the backend
      await sendNftMintRequest(blob);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    }
  };
  // if there is no user only a connect wallet button shows up 
  if (!wallet){
    return(
      <div>
        <ConnectButton client={client} appMetadata={{ name: "High Monkey", url: "https://example.com" }} />
      </div>
    )
  }
  return (
    <div>
      <div
        style={{
          padding: "2rem",
          backgroundColor: "#333",
          borderRadius: "10px",
          marginRight: "2rem",
        }}
      >
        <ConnectButton
          client={client}
          appMetadata={{ name: "High Monkey", url: "https://example.com" }}
        />
  
        {/* Attribute Selection Sections */}
        <div>
          <h3>Select a Background</h3>
          {backgrounds.map((bg) => (
            <img
              key={bg}
              src={bg}
              onClick={() => setBackground(bg)}
              style={{
                width: "100px",
                cursor: "pointer",
                border: background === bg ? "2px solid royalblue" : "",
                marginRight: "1rem",
              }}
            />
          ))}
        </div>
  
        <div>
          <h3>Select a Face</h3>
          {tops.map((t) => (
            <img
              key={t}
              src={t}
              onClick={() => setTop(t)}
              style={{
                width: "100px",
                cursor: "pointer",
                border: top === t ? "2px solid royalblue" : "",
                marginRight: "1rem",
              }}
            />
          ))}
        </div>
  
        <div>
          <h3>Select a Fur</h3>
          {furs.map((f) => (
            <img
              key={f}
              src={f}
              onClick={() => setFur(f)}
              style={{
                width: "100px",
                cursor: "pointer",
                border: fur === f ? "2px solid royalblue" : "",
                marginRight: "1rem",
              }}
            />
          ))}
        </div>
  
        <div>
          <h3>Select a Shirt</h3>
          {skins.map((s) => (
            <img
              key={s}
              src={s}
              onClick={() => setSkin(s)}
              style={{
                width: "100px",
                cursor: "pointer",
                border: skin === s ? "2px solid royalblue" : "",
                marginRight: "1rem",
              }}
            />
          ))}
        </div>
  
        <div>
          <h3>Select a Smoke</h3>
          {mouths.map((mo) => (
            <img
              key={mo}
              src={mo}
              onClick={() => setMouth(mo)}
              style={{
                width: "100px",
                cursor: "pointer",
                border: mouth === mo ? "2px solid royalblue" : "", // Compare correctly
                marginRight: "1rem",
              }}
            />
          ))}
        </div>
  
        <div>
          <h3>Select Glasses</h3>
          {glasses.map((g) => (
            <img
              key={g}
              src={g}
              onClick={() => setGlass(g)}
              style={{
                width: "100px",
                cursor: "pointer",
                border: glass === g ? "2px solid royalblue" : "",
                marginRight: "1rem",
              }}
            />
          ))}
        </div>
  
        <div>
          <h3>Select Jewelry</h3>
          {jewelry.map((j) => (
            <img
              key={j}
              src={j}
              onClick={() => setJewel(j)}
              style={{
                width: "100px",
                cursor: "pointer",
                border: jewel === j ? "2px solid royalblue" : "",
                marginRight: "1rem",
              }}
            />
          ))}
        </div>
  
        {/* Mint Button */}
        {background && top && fur && skin && mouth && glass && jewel && (
          <button
            onClick={convertCanvasToBlob}
            disabled={isNftMinting}
            style={{
              padding: "1rem",
              marginTop: "3rem",
              cursor: "pointer",
              backgroundColor: "royalblue",
              color: "white",
              border: "none",
              borderRadius: "5px",
              width: "100%",
            }}
          >
            {isNftMinting ? "Minting ..." : "Mint NFT"}
          </button>
        )}
      </div>
  
      {/* Canvas Preview */}
      <div>
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          style={{ border: "1px solid black", marginTop: "20px" }}
        />
      </div>
    </div>
  );
  
}
