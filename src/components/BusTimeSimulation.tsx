'use client'

import { useState, useEffect } from 'react';
import { Button } from "@nextui-org/react";
import { prepareContractCall, readContract } from "thirdweb";
import { getTransitContract } from "@/utils/contracts";
import { transitContractAddress } from "@/utils/contractsAddress";
import toast from "react-hot-toast";

export default function BusTimeSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  const generateRandomTimestamp = () => {
    // Generate a random timestamp within the next 24 hours
    return Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 86400);
  };

  const compareTimesOnChain = async (currentTime: bigint, nextTime: bigint) => {
    try {
        const result =await readContract({
            contract:getTransitContract(transitContractAddress),
            method:'compareBusArrivalTimes',
            params:[currentTime,nextTime]
          })
          console.log('time 1',currentTime,'next time ',nextTime,'result ',result)
    //   const result = await contract.call('compareBusArrivalTimes', [currentTime, nextTime]);
      return result;
    } catch (error) {
      console.error('Error comparing times:', error);
      return false;
    }
  };

  const startSimulation = async () => {
    setIsSimulating(true);
    setSimulationLog([]);
    setSimulationResult(null);

    let simulationCount = 0;
    const maxSimulations = 10; // Limit to prevent infinite loop

    while (isSimulating && simulationCount < maxSimulations) {
      const currentTime = BigInt(generateRandomTimestamp());
      const nextTime = BigInt(generateRandomTimestamp());

      try {
        const isAuthorized = await compareTimesOnChain(currentTime, nextTime);
        
        const logEntry = `Simulation ${simulationCount + 1}: 
          Current Time: ${new Date(Number(currentTime) * 1000).toUTCString()}
          Next Time: ${new Date(Number(nextTime) * 1000).toUTCString()}
          Departure: ${isAuthorized ? 'AUTHORIZED ✅' : 'NOT AUTHORIZED ❌'}`;
        
        setSimulationLog(prev => [logEntry, ...prev]);

        if (!isAuthorized) {
          setSimulationResult('Departure Not Authorized');
          break;
        }

        simulationCount++;
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        toast.error('Simulation error');
        break;
      }
    }

    if (simulationCount === maxSimulations) {
      setSimulationResult('Simulation Completed Successfully');
    }

    setIsSimulating(false);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSimulationResult('Simulation Stopped');
  };

  return (
    <div className="flex flex-col gap-4 mt-4 p-4 border rounded-lg">
      <h2 className="text-lg font-bold">Bus Time Simulation</h2>
      <div className="flex gap-4">
        <Button 
          color="primary" 
          onClick={async ()=>await startSimulation()} 
          isDisabled={isSimulating}
        >
          Start Simulation
        </Button>
        <Button 
          color="danger" 
          onClick={()=>stopSimulation()} 
          isDisabled={!isSimulating}
        >
          Stop Simulation
        </Button>
      </div>
      {simulationResult && (
        <div 
          className={`p-2 rounded ${
            simulationResult.includes('Not Authorized') 
              ? 'bg-red-200 text-red-800' 
              : 'bg-green-200 text-green-800'
          }`}
        >
          {simulationResult}
        </div>
      )}
      <div className="max-h-64 overflow-y-auto">
        <h3 className="font-semibold">Simulation Log:</h3>
        {simulationLog.map((log, index) => (
          <div 
            key={index} 
            className={`p-2 border-b ${
              log.includes('NOT AUTHORIZED') 
                ? 'bg-red-50' 
                : 'bg-green-50'
            }`}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}