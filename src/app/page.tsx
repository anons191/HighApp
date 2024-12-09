"use client";
import { getContract, readContract } from "thirdweb";
import {
  ConnectButton,
  useActiveWallet,
  useSendAndConfirmTransaction,
} from "thirdweb/react";
import { client } from "./client";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import {  baseSepolia,base, sepolia } from "thirdweb/chains";
import { toWei } from "thirdweb/utils";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
// Helper function to get just the filename from the path
const getFileName = (path: string | string[]) => {
  if (Array.isArray(path)) {
    path = path[0]; // Take the first element if it's an array
  }
  return path.split('/').pop()?.split('.')[0] || ""; // Extracts filename without extension
};

// NFT Attribute Options
const backgrounds = ["/images/BackgroundBeige.png", "/images/BackgroundGold.png", "/images/BackgroundGrey.png","/images/BackgroundMatrix.png","/images/BackgroundBlueDream.png","/images/BackgroundPurpleHaze.png","/images/BackgroundNinjaCat.png","/images/BackgroundPlatinum02.png"];
const tops = ["/images/HoodieBTC.png", "/images/HoodieLogo.png", "/images/ShirtTang.png", "/images/SuitPurple.png","/images/HoodieFreeRoss.png","/images/SuitGold2.png","/images/RobeWizard.png","/images/SuitPlatinum.png"];
const furs = ["/images/FurBlue.png", "/images/FurGold2.png", "/images/FurRed.png", "/images/FurGreen.png","/images/FurOrange.png","/images/FurPink.png","/images/FurPurple.png","/images/FurPlatinum.png"];
const skins = [ "/images/SkinGold.png", "/images/SkinNatural.png", "/images/SkinZombie.png","/images/SkinPlatinum.png"];
const mouths = ["/images/MouthBlunt.png", "/images/MouthGoldGrill.png", "/images/MouthTongue.png","/images/MaskGuyFawkes.png","/images/MouthPlatinumGrill.png","/images/USAMask.png"];
const glasses = ["None","/images/Eyepatch.png", "/images/Glasses3D.png", "/images/GlassesAviator.png", "/images/GlassesHeart.png", "/images/GlassesPurpleRound.png", "/images/GlassesYeezy.png","/images/GlassesMonocle.png","/images/GlassesTang.png","/images/GlassesBlueSilver.png","/images/GlassesBase.png"];
const extra = ["None", "/images/CupBrettGoldJava2.png", "/images/EarringHex.png", "/images/GoldHoopEarring.png", "/images/HatWizard.png", "/images/HeadbandNinjaCat.png", "/images/CrownGold.png", "/images/CrownPlatinum.png","/images/GMGold02.png","/images/GMPlatinum.png","/images/GMZombie02.png","/images/HoopEarringSilver.png","/images/PendantAfrica.png"];


// Configuration
const WALLET_ADDRESS = "0x575A9960be5f23C8E8aF7F9C8712A539eB255bE6";
const MINT_PRICE = toWei("0.00005516237043738244"); // ETH
const MAX_SUPPLY = 1000; // Set your max supply here
const CONTRACT_ADDRESS = "0x095a7b3C834903346c3095e90074A5E2559AD919" ;

interface NFTAttributes {
  background: string;
  top: string;
  fur: string;
  skin: string;
  mouth: string;
  glass: string;
  extra: string;
}

export default function Home() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalMinted, setTotalMinted] = useState<number>(0);
  const [isMaxSupplyReached, setIsMaxSupplyReached] = useState<boolean>(false);



  // Fetch the total minted count
  const fetchTotalMinted = async () => {
    try {
      const contract = await getContract({
        client,
        address: CONTRACT_ADDRESS,
        chain: base,
      });

      const totalSupply = await readContract({
        contract,
        method: "function totalSupply() view returns (uint256)",
        params: [],
      });

      const minted = Number(totalSupply);
      setTotalMinted(minted);
      setIsMaxSupplyReached(minted >= MAX_SUPPLY);
    } catch (error) {
      console.error("Error fetching total supply:", error);
      alert("Failed to fetch total supply. Please try again later.");
    }
  };

  useEffect(() => {
    fetchTotalMinted();
  }, []);

  const songs = [
    './mp3/YoungPeezyGlobal.mp3',
    './mp3/freedompeezy.wav',
    './mp3/pezzynicewithit.mp3',
    './mp3/YoungPeezymiliestobillies.mp3',
    './mp3/YoungPeezyValhalla.mp3',
    './mp3/YoungPeezywaitisover.mp3',
  ]; // Array of song URLsurrentSongIndex, setCurrentSongIndex] = useState(0); // Track current song
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // Track current song
  
  
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
        .catch((error) => console.error("Error playing music:", error));
    } else {
      // Initialize a new audio instance if none exists
      const backgroundAudio = new Audio(songs[currentSongIndex]);
      backgroundAudio.loop = false; // Disable looping to allow cycling
  
      // Set up the 'ended' event listener to play the next song
      backgroundAudio.addEventListener('ended', playNextSong);
  
      setAudio(backgroundAudio);
  
      // Play the audio and update the state
      backgroundAudio
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error("Error playing music:", error));
    }
  };
  
  const playNextSong = () => {
    if (audio) {
      audio.pause(); // Stop the current audio
      audio.removeEventListener('ended', playNextSong); // Remove previous event listener
    }
  
    // Increment the song index, cycling back to the first song if at the end
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
  
    const nextAudio = new Audio(songs[nextIndex]);
    nextAudio.loop = false; // Disable looping for the new song
  
    // Set up the 'ended' event listener for the new audio
    nextAudio.addEventListener('ended', playNextSong);
  
    setAudio(nextAudio);
  
    nextAudio
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => console.error("Error playing next song:", error));
  };
  
  // Display the current song
  const getCurrentSongName = () => {
    // Extract just the file name from the path
    return songs[currentSongIndex].split('/').pop();
  };
    

  // Twitter Sharing Function
  const handleTwitterShare = (nftName: string, ipfsUri: string): void => {
    // Convert IPFS URI to a web-accessible HTTP URL
    const ipfsHttpUrl = ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
  
    // Prepare Twitter share URL
    const tweetText = encodeURIComponent(`I just minted a ${nftName}! Check it out:`);
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
    extra: "",
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
          attributes.extra,
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
     formData.append("extra", getFileName(attributes.extra));
     
     
      
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
  
    if (isMaxSupplyReached) {
      alert("Max supply reached. No more NFTs can be minted.");
      return;
    }

    setNftMinting(true);

    
  
    try {
      // Step 1: Prepare payment transaction
      const tx = {
        //where the nft lands
        to: WALLET_ADDRESS,
        // turns price into wei
        value: MINT_PRICE,
        // chain in use
        chain: base,
        client: client,
      };
      console.log("Transaction object:", tx);

      

      // Step 2: Send payment and wait for confirmation
      await new Promise((resolve, reject) => {
        sendAndConfirmTx(tx, {
          onSuccess: (transactionRecipt) => {
            console.log("Payment confirmed!", transactionRecipt); // Log payment receipt
            resolve(transactionRecipt.transactionHash); // Resolve the promise on success
          },
          onError: (txError) => {
            console.error("Transaction details:", tx); // Log transaction details
            console.error("Transaction failed:", txError); // Log transaction error
            reject(new Error("Payment failed or was rejected or you don't have the right balance")); // Reject the promise
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
      <div className="flex flex-col justify-center items-center min-h-screen">
      <ConnectButton
        client={client}
   
        appMetadata={{
          name: "High Monkey",
          url: "https://example.com",
        }}
      />
      <p className="mt-4 text-red-500 text-center">
        Please use an external wallet like MetaMask or Coinbase. In-app wallets are not supported at this time. Please also use desktop as mobile has been having errors
        If you pay and nothing mints than contact me on x @Highmonkey888, email highmonkey888@gamil.com
      </p>
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
        <div className="flex justify-between mb-6">
        <div>
    <div>
    <p>
  Now Playing: <a href='https://youngpeezyonbase.com/' target="_blank" rel="noopener noreferrer">{getCurrentSongName()}</a>
</p>

    </div>
    <button 
      onClick={startMusic} 
      className={`button ${isPlaying ? 'pause-button' : 'play-button'}`}
      aria-label={isPlaying ? "Pause Background Music" : "Play Background Music"}
    >
      {isPlaying ? '❚❚' : '▶'}
    </button>
    <button 
      onClick={playNextSong} 
      className="button next-button"
      aria-label="Play Next Song"
    >
      Next
    </button>
  </div>
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
            options={extra}
            selected={attributes.extra}
            onChange={(value) => updateAttribute("extra", value)}
          />

          {/* Mint Button */}
          {isReadyToMint && (
            <button
            className={`w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg
              ${isNftMinting || isMaxSupplyReached ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            onClick={() => {
              alert('Do not refresh the page');
              handleMint();
            }}
            disabled={isNftMinting || isMaxSupplyReached}
          >
            {isMaxSupplyReached ? "Sold Out" : isNftMinting ? "Minting..." : "Mint NFT"}
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

{/* Total Minted Display */}
<div className="text-center text-white text-2xl mt-6">
  <p>Total Minted: {totalMinted} / {MAX_SUPPLY}</p>
  <p className="text-lg text-gray-300 mt-2">
    Mint Price: $20.00 USD or 0.005000549785583622 ETH
  </p>
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
