"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const contractABI =
  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "candidates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "candidatesCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_candidateId",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voters",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Update after deployment

const VotingDApp = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum === "undefined") {
        console.log("Please install MetaMask!");
        setLoading(false);
        return;
      }

      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();
        setSigner(signer);
        setAccount(address);

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);

        const count = await contract.candidatesCount();
        const countNumber = Number(count); // BigInt to number
        const candidatesList = [];

        for (let i = 1; i <= countNumber; i++) {
          const candidate = await contract.candidates(i);
          candidatesList.push({
            id: Number(candidate.id),
            name: candidate.name,
            voteCount: Number(candidate.voteCount),
          });
        }

        setCandidates(candidatesList);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing:", error);
        setLoading(false);
      }
    };

    init();
  }, []);

  const vote = async (candidateId: number) => {
    if (!contract || !signer) return;

    try {
      const tx = await contract.vote(candidateId);
      await tx.wait();

      const updatedCandidate = await contract.candidates(candidateId);
      setCandidates(prev =>
        prev.map(c =>
          c.id === candidateId
            ? { ...c, voteCount: Number(updatedCandidate.voteCount) }
            : c
        )
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Voting DApp</h1>
      <p className="text-center mb-4">
        Connected Account: {account || "Not connected"}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map(candidate => (
          <div key={candidate.id} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{candidate.name}</h2>
            <p>Votes: {candidate.voteCount}</p>
            <button
              onClick={() => vote(candidate.id)}
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingDApp;