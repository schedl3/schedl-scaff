import React from "react";
import { formatEther, parseEther } from "viem";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const ChedPriceMintDeposit = () => {
  const { data: currentMintPrice } = useScaffoldContractRead({
    contractName: "SchedlToken",
    functionName: "currentMintPrice",
  });

  return currentMintPrice ? <MintDeposit currentMintPrice={currentMintPrice} /> : null;
};

const MintDeposit = ({ currentMintPrice }: any) => {
  console.log(formatEther(currentMintPrice as bigint));
  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "SchedlToken",
    functionName: "mintAndDeposit",
    args: [parseEther("1")],
    value: `${parseFloat(formatEther(currentMintPrice))}`,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  return (
    <div className="">
      <button className={`btn btn-sm btn-primary ${isLoading ? "loading" : ""}`} onClick={() => writeAsync()}>
        {!isLoading && <>Mint&amp;Deposit 1 CHED</>}
      </button>
      (Price: {formatEther(currentMintPrice as bigint)} ETH)
    </div>
  );
};
