"use client";

import {
  ConnectButton,
  useActiveWallet,
  useSendAndConfirmTransaction,
} from "thirdweb/react";
import { client } from "./client";
import { sepolia, base } from "thirdweb/chains";
import { toWei } from "thirdweb/utils";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
// Helper function to get just the filename from the path
const getFileName = (path: string) => {
  return path.split('/').pop()?.split('.')[0] || ""; // Extracts filename without extension
};


// NFT Attribute Options
const backgrounds = ["/images/BackgroundBeige.png", "/images/BackgroundGold.png", "/images/BackgroundGrey.png","/images/BackgroundMatrix.png","/images/BackgroundBlueDream.png","/images/BackgroundPurpleHaze.png","/images/BackgroundNinjaCat.png","/images/backgroundPlatinum.png"];
const tops = ["/images/HoodieBTC.png", "/images/HoodieLogo.png", "/images/ShirtHawaiian.png", "/images/SuitPurple.png","/images/HoodieFreeRoss.png","/images/SuitGold2.png","/images/RobeWizard.png","/images/SuitPlatinum.png"];
const furs = ["/images/FurBlue.png", "/images/FurGold2.png", "/images/FurRed.png", "/images/FurGreen.png","/images/FurOrange.png","/images/FurPink.png","/images/FurPurple.png","/images/FurPlatinum.png"];
const skins = [ "/images/SkinGold.png", "/images/SkinNatural.png", "/images/SkinZombie.png","/images/SkinPlatinum.png"];
const mouths = ["/images/MouthBlunt.png", "/images/MouthGoldGrill.png", "/images/MouthTongue.png","/images/MaskGuyFawkes.png","/images/MouthPlatinumGrill.png"];
const glasses = ["None","/images/Eyepatch.png", "/images/Glasses3D.png", "/images/GlassesAviator.png", "/images/GlassesHeart.png", "/images/GlassesPurpleRound.png", "/images/GlassesYeezy.png","/images/GlassesMonocle.png","/images/GlassesTang.png","/images/GlassesBlueSilver.png"];
const jewelry = ["None", "/images/GMZombie.png", "/images/GoldGM.png", "/images/GoldHoopEarring.png", "/images/HatWizard.png", "/images/HeadbandNinjaCat.png", "/images/CrownGold.png", "/images/CrownPlatinum.png"];


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
  const [isPlaying, setIsPlaying] = useState(false);

  const startMusic = () => {
    if (isPlaying && audio) {
      // Pause the audio and update the state
      audio.pause();
      setIsPlaying(false);
    } else if (audio) {
      // Resume playback and update the state
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error("Error playing music:", error));
    } else {
      // Initialize a new audio instance if none exists
      const backgroundAudio = new Audio('./mp3/music_zapsplat_electric_drum_and_bass.mp3');
      backgroundAudio.loop = true; // Enable looping
      setAudio(backgroundAudio);
  
      // Play the audio and update the state
      backgroundAudio
        .play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error("Error playing music:", error));
    }
  };
    

  // Twitter Sharing Function
  const handleTwitterShare = (nftName: string, ipfsUri: string): void => {
    // Convert IPFS URI to a web-accessible HTTP URL
    const ipfsHttpUrl = ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  
    // Prepare Twitter share URL
    const tweetText = encodeURIComponent(`I just minted a test net${nftName}! Check it out:`);
    const url = encodeURIComponent(ipfsHttpUrl); // Use the HTTP URL here
    const hashtags = encodeURIComponent("HighMonkey,NFT,Web3");
  
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${url}&hashtags=${hashtags}`;
  
    console.log("Twitter share URL:", twitterShareUrl); // Log for debugging
    window.open(twitterShareUrl, "_blank"); // Open the Twitter share URL
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
      if (!src || src === "None") {
        resolve(new Image()); // Return an empty image for "None"
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
          attributes.glass,
          attributes.jewel,
          attributes.mouth,
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
  const sendNftMintRequest = async (blob: Blob): Promise<{ ipfsUri: string }> => {
    const account = wallet?.getAccount();
    const address = account?.address;
    
    if (!address) {
      throw new Error("No wallet address found");
    }

    const formData = new FormData();
    formData.append("image", blob, "nft.png");
    formData.append("address", address);

     // Add attribute data by stripping paths down to names
     formData.append("background", getFileName(attributes.background));
     formData.append("top", getFileName(attributes.top));
     formData.append("fur", getFileName(attributes.fur));
     formData.append("skin", getFileName(attributes.skin));
     formData.append("mouth", getFileName(attributes.mouth));
     formData.append("glass", getFileName(attributes.glass));
     formData.append("jewel", getFileName(attributes.jewel));
     
      
    const response = await fetch("/api/mintNft", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "NFT minting failed");
    }
    console.log("Response from backend:", response);

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
      // Step 1: Prepare payment transaction
      const tx = {
        //where the nft lands
        to: WALLET_ADDRESS,
        // turns price into wei
        value: toWei(MINT_PRICE),
        // chain in use
        chain: sepolia,
        client: client,
      };
  
      // Step 2: Send payment and wait for confirmation
      await new Promise((resolve, reject) => {
        sendAndConfirmTx(tx, {
          onSuccess: (receipt) => {
            console.log("Payment confirmed!", receipt); // Log payment receipt
            resolve(receipt); // Resolve the promise on success
          },
          onError: (txError) => {
            console.error("Transaction failed:", txError); // Log transaction error
            reject(new Error("Payment failed or was rejected")); // Reject the promise
          },
        });
      });
  
      // Step 3: Convert the canvas content to a Blob
      const blob = await convertCanvasToBlob();
  
      // Step 4: Send minting request and retrieve IPFS URI
      const response = await sendNftMintRequest(blob); // Send the blob to the backend
      const ipfsUri = response.ipfsUri; // Extract the IPFS URI from the response
  
      if (!ipfsUri) {
        throw new Error("IPFS URI not returned by the backend."); // Throw error if IPFS URI is missing
      }
  
      // Step 5: Share the minted NFT on Twitter
      const nftName = "High Monkey NFT"; // Define the name of the NFT (can be dynamic)
      handleTwitterShare(nftName, ipfsUri); // Call the sharing function with the name and URI
  
      // Step 6: Trigger confetti for success
      setShowConfetti(true); // Show confetti animation
      setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
  
      alert("NFT minted successfully!"); // Notify the user
    } catch (error) {
      console.error("Minting process failed:", error); // Log the error
  
      // Provide a user-friendly error message
      const message =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during the minting process";
  
      alert(`Minting failed: ${message}`);
    } finally {
      // Step 7: Reset the minting state
      setNftMinting(false); // Ensure the state is reset even if an error occurs
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
                <button 
          onClick={startMusic} 
          className={`button ${isPlaying ? 'pause-button' : 'play-button'}`}
          aria-label={isPlaying ? "Pause Background Music" : "Play Background Music"}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>

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
            title="Extras"
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
          <div
            key={option}
            onClick={() => onChange(option)}
            className={`cursor-pointer rounded-lg border-2 flex items-center justify-center
              ${selected === option ? 'border-blue-500' : 'border-transparent'}
              ${option === "None" ? "bg-gray-700 text-white" : ""}`}
            style={{ height: "100px", width: "100px" }}
          >
            {option === "None" ? (
              <span>None</span> // Render "None" text
            ) : (
              <img
                src={option}
                alt={`${title} option`}
                className="rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
