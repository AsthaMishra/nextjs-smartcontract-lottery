import { useWeb3Contract } from "react-moralis";
import abi from "../constants/abi.json";
import contractAddress from "../constants/contractaddress.json";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function EnterLottery() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const lotteryContractAddress =
        chainId in contractAddress ? contractAddress[chainId][0] : null;
    console.log(lotteryContractAddress);

    const dispatch = useNotification();

    const [entranceFee, setEntranceFee] = useState("0");
    const [playerCount, setPlayerCount] = useState("0");
    const [winner, setWinner] = useState("0");

    const {
        runContractFunction: enterLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryContractAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    });

    const { runContractFunction: getEntryFees } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryContractAddress,
        functionName: "getEntryFees",
        params: {},
    });

    const { runContractFunction: getPlayerCount } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryContractAddress,
        functionName: "getPlayerCount",
        params: {},
    });

    const { runContractFunction: getWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryContractAddress,
        functionName: "getWinner",
        params: {},
    });

    async function handleSuccess(tx) {
        tx.wait(1);
        UIUpdate();
        handleNewNotification("success");
    }
    async function handleError() {
        handleNewNotification("error");
        UIUpdate();
    }

    function handleNewNotification(type) {
        dispatch({
            type: type,
            message: "Transaction Complete!",
            title: "Transaction Response",
            icon: "bell",
            position: "topR",
        });
    }

    async function UIUpdate() {
        const entranceFeeFromCall = (await getEntryFees()).toString();
        const playerCountFromCall = (await getPlayerCount()).toString();
        const winnerFromCall = await getWinner();
        console.log(entranceFeeFromCall);
        console.log(playerCountFromCall);
        console.log(winnerFromCall);
        setEntranceFee(entranceFeeFromCall);
        setPlayerCount(playerCountFromCall);
        setWinner(winnerFromCall);
    }

    useEffect(() => {
        isWeb3Enabled ? UIUpdate() : <div>Waiting For Connection</div>;
    }, [isWeb3Enabled]);

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
            {lotteryContractAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterLottery({
                                onSuccess: handleSuccess,
                                onError: handleError,
                            });
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <div>
                        Entrance Fee:
                        {ethers.utils.formatUnits(entranceFee, "ether")}
                        ETH
                    </div>

                    <div>Total Player In Game : {playerCount}</div>

                    <div>Last Winner : {winner}</div>
                </>
            ) : (
                <div> Enter Lottery is not available of\n this chain</div>
            )}
        </div>
    );
}
