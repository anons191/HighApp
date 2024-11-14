"use client";

import {
  ConnectButton,
  useActiveWallet,
  useSendAndConfirmTransaction,
} from "thirdweb/react";
import { client } from "./client";
import { sepolia } from "thirdweb/chains";
import { toWei } from "thirdweb/utils";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
// Helper function to get just the filename from the path
const getFileName = (path: string) => {
  return path.split('/').pop()?.split('.')[0] || ""; // Extracts filename without extension
};


// NFT Attribute Options
const backgrounds = ["/images/BackgroundBeige.png", "/images/BackgroundGold.png", "/images/BackgroundGrey.png"];
const tops = ["/images/HoodieBTC.png", "/images/HoodieLogo.png", "/images/ShirtHawaiian.png", "/images/SuitPurple.png"];
const furs = ["/images/FurBlue.png", "/images/FurGold2.png", "/images/FurRed.png", "/images/FurGreen.png"];
const skins = [ "/images/SkinGold.png", "/images/SkinNatural.png", "/images/SkinZombie.png"];
const mouths = ["/images/MouthBlunt.png", "/images/MouthGoldGrill.png", "/images/MouthTongue.png",];
const glasses = ["/images/Eyepatch.png", "/images/Glasses3D.png", "/images/GlassesAviator.png", "/images/GlassesHeart.png", "/images/GlassesPurpleRound.png", "/images/GlassesYeezy.png"];
const jewelry = ["/images/GMZombie.png", "/images/GoldGM.png", "/images/GoldHoopEarring.png"];

// Configuration
const WALLET_ADDRESS = "0x575A9960be5f23C8E8aF7F9C8712A539eB255bE6";
const MINT_PRICE = "0.0001"; // ETH

interface NFTAttributes {
  background: string;
  top: string;
  fur: string;
  skin: string;
  mouth: string;
  glass: string;
  jewel: string;
}

export default function Home() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const startMusic = () => {
   if (audio && !audio.paused) {
      // Pause and reset the audio if it's already playing
      audio.pause();
      setAudio(null); // Reset audio so it can be initialized again if needed
    } else if (audio) {
      // If the audio is initialized but paused, play it
      audio.play().catch(error => console.error("Error playing music:", error));
    } else {
      // Initialize the audio when the user clicks the button and it's not yet set
      const backgroundAudio = new Audio('./mp3/music_zapsplat_electric_drum_and_bass.mp3');
      backgroundAudio.loop = true;
      setAudio(backgroundAudio);
  
      // Play the audio
      backgroundAudio.play().catch(error => console.error("Error playing music:", error));
    }
  };
  
  // Cleanup the audio on component unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);
  
  
  const wallet = useActiveWallet();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { mutate: sendAndConfirmTx } = useSendAndConfirmTransaction();

  // State Management
  const [isNftMinting, setNftMinting] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize(); 
  const [attributes, setAttributes] = useState<NFTAttributes>({
    background: "",
    top: "",
    fur: "",
    skin: "",
    mouth: "",
    glass: "",
    jewel: "",
  });

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000); // Show confetti for 3 seconds
  }, []);
  


  // Helper function to load images safely
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(new Image()); // Return empty image for empty sources
        return;
      }
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
  };

  // Update canvas when attributes change
  useEffect(() => {
    const updateCanvas = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imageSources = [
          attributes.background,
          attributes.top,
          attributes.fur,
          attributes.skin,
          attributes.mouth,
          attributes.glass,
          attributes.jewel,
        ];

        const images = await Promise.all(imageSources.map(loadImage));

        images.forEach((img) => {
          if (img.src) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        });
      } catch (error) {
        console.error("Failed to update canvas:", error);
        alert("Failed to load one or more images. Please try different selections.");
      }
    };

    updateCanvas();
  }, [attributes]);

  // Convert canvas to blob for minting
  const convertCanvasToBlob = async (): Promise<Blob> => {
    if (!canvasRef.current) {
      throw new Error("Canvas not initialized");
    }

    return new Promise((resolve, reject) => {
      canvasRef.current?.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert canvas to blob"));
      });
    });
  };

  // Send NFT mint request to backend
  const sendNftMintRequest = async (blob: Blob): Promise<any> => {
    const account = wallet?.getAccount();
    const address = account?.address;
    
    if (!address) {
      throw new Error("No wallet address found");
    }

    const formData = new FormData();
    formData.append("image", blob, "nft.png");
    formData.append("address", address);

     // Add attribute data by stripping paths down to names
  formData.append("attributes", JSON.stringify({
    background: getFileName(attributes.background),
    top: getFileName(attributes.top),
    fur: getFileName(attributes.fur),
    skin: getFileName(attributes.skin),
    mouth: getFileName(attributes.mouth),
    glass: getFileName(attributes.glass),
    jewel: getFileName(attributes.jewel),
  }));

    const response = await fetch("/api/mintNft", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "NFT minting failed");
    }

    return data;
  };

  // Handle the minting process
const handleMint = async () => {
  if (!wallet) {
    alert("Please connect your wallet first");
    return;
  }

  setNftMinting(true);

  try {
    // Prepare payment transaction
    const tx = {
      to: WALLET_ADDRESS,
      value: toWei(MINT_PRICE),
      chain: sepolia,
      client: client,
    };

    // Send payment and wait for confirmation
    await new Promise((resolve, reject) => {
      sendAndConfirmTx(tx, {
        onSuccess: (receipt) => {
          console.log("Payment confirmed!", receipt);
          resolve(receipt);
        },
        onError: (txError) => {
          console.error("Transaction failed:", txError);
          reject(new Error("Payment failed or was rejected"));
        },
      });
    });

    // Convert canvas to blob
    const blob = await convertCanvasToBlob();

    // Send minting request
    await sendNftMintRequest(blob);
    setShowConfetti(true); // Trigger confetti on success
    setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
    alert("NFT minted successfully!");
  } catch (error) {
    console.error("Minting process failed:", error);

    const message = error instanceof Error
      ? error.message
      : "An unknown error occurred during the minting process";

    alert(`Minting failed: ${message}`);
  } finally {
    setNftMinting(false);
  }
};

  // Update individual attributes
  const updateAttribute = (key: keyof NFTAttributes, value: string) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  // Check if all attributes are selected
  const isReadyToMint = Object.values(attributes).every(value => value !== "");
  
  // Render connect wallet button if no wallet is connected
  if (!wallet) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ConnectButton 
          client={client} 
          appMetadata={{ 
            name: "High Monkey", 
            url: "https://example.com" 
          }} 
        />
      </div>
    );
  }

  // Main component render
  return (
    <div className="container mx-auto p-4 flex flex-wrap">
    {/* Render Confetti if showConfetti is true */}
    {showConfetti && <Confetti width={width || 500} height={height || 500} />}


    <div className="w-full md:w-1/2 p-4">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <ConnectButton
            client={client}
            appMetadata={{ name: "High Monkey", url: "https://example.com" }}
          />
        </div>
        <div>
      <button onClick={startMusic}>Play Background Music</button>
    </div>

          {/* Attribute Sections */}
          <AttributeSection
            title="Background"
            options={backgrounds}
            selected={attributes.background}
            onChange={(value) => updateAttribute("background", value)}
          />
          <AttributeSection
            title="Top"
            options={tops}
            selected={attributes.top}
            onChange={(value) => updateAttribute("top", value)}
          />
          <AttributeSection
            title="Fur"
            options={furs}
            selected={attributes.fur}
            onChange={(value) => updateAttribute("fur", value)}
          />
          <AttributeSection
            title="Skin"
            options={skins}
            selected={attributes.skin}
            onChange={(value) => updateAttribute("skin", value)}
          />
          <AttributeSection
            title="Mouth"
            options={mouths}
            selected={attributes.mouth}
            onChange={(value) => updateAttribute("mouth", value)}
          />
          <AttributeSection
            title="Glasses"
            options={glasses}
            selected={attributes.glass}
            onChange={(value) => updateAttribute("glass", value)}
          />
          <AttributeSection
            title="Jewelry"
            options={jewelry}
            selected={attributes.jewel}
            onChange={(value) => updateAttribute("jewel", value)}
          />

          {/* Mint Button */}
          {isReadyToMint && (
            <button
              className={`w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg
                ${isNftMinting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              onClick={handleMint}
              disabled={isNftMinting}
            >
              {isNftMinting ? "Minting..." : "Mint NFT"}
            </button>
          )}
        </div>
      </div>

      {/* Canvas Preview */}
      <div className="w-full md:w-1/2 p-4">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="border border-gray-300 rounded-lg canvas-sticky"
        />
      </div>
    </div>
  );
}

// Attribute Section Component
interface AttributeSectionProps {
  title: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

function AttributeSection({ title, options, selected, onChange }: AttributeSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <img
            key={option}
            src={option}
            onClick={() => onChange(option)}
            className={`cursor-pointer rounded-lg border-2 
              ${selected === option ? 'border-blue-500' : 'border-transparent'}`}
            alt={`${title} option`}
          />
        ))}
      </div>
    </div>
  );
}