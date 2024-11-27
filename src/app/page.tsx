'use client'

import { getTransitContract } from "@/utils/contracts";
import { adminAddress, transitContractAddress } from "@/utils/contractsAddress";
import { Button, Input, TimeInput } from "@nextui-org/react";
import { error } from "console";
import { useEffect, useState } from "react";
import toast, { useToaster } from "react-hot-toast";
import { prepareContractCall, PreparedTransaction, readContract, toEther, toUnits } from "thirdweb";
import { useActiveAccount, useActiveWallet, useReadContract, useSendAndConfirmTransaction, useWalletBalance } from "thirdweb/react";
import {useDateFormatter} from "@react-aria/i18n";
import {parseAbsoluteToLocal, Time, ZonedDateTime} from "@internationalized/date";
import { elysiumChain } from "./Header";
import { thirdWebClient } from "@/components/ConnectWallet";
import { getWalletBalance } from "thirdweb/wallets";



export default function Home() {
const activeAccount = useActiveAccount()
const [isAdmin,setIsAdmin]=useState(false)
const [ticketsArray,setTicketsArray]=useState< readonly bigint[]>()
const [ticketId,setTicketId]=useState<bigint>()
const [ticketPrice,setTicketPrice]=useState('')
const [ticketCurrentPrice,setTicketCurrentPrice]=useState<bigint>()
const [passangerCount,setPassangerCount]=useState<bigint>()
const [currentBusArivalTime,setCurrentBusArrivalTime]=useState<any>();
const [nextBusArivalTime,setNextBusArrivalTime]=useState<any>();
const [contractCurrentTime,setContractCurrentTime]=useState<any>()
const [contractNextTime,setContractNextTime]=useState<any>()
const [yourTicketId,setYourTicketId]=useState<any>()
const {data:balanceData}=useWalletBalance({
  client:thirdWebClient,
  chain:elysiumChain,
  address:activeAccount?.address
})

const checkAdmin = ()=>{
  console.log('activeAccount?.address : ',activeAccount?.address)
  if(activeAccount?.address==adminAddress){
    setIsAdmin(true)
  }
}
const {
  mutateAsync: arivalTimeTransaction,
  isPending:  arivalTimeTransactionPending,
} = useSendAndConfirmTransaction();
const {
  mutateAsync: buyTicketTransaction,
  isPending:  buyTicketTransactionPending,
} = useSendAndConfirmTransaction();
const {
  mutateAsync: withdrawFundsTransaction,
  isPending:  withdrawFundsTransactionPending,
} = useSendAndConfirmTransaction();
const {
  mutateAsync: genrateTicketTransaction,
  isPending: genrateTransactionPending,
} = useSendAndConfirmTransaction();
const {
  mutateAsync: startNewBusTransaction,
  isPending: newBusPending,
} = useSendAndConfirmTransaction();
const {
  mutateAsync: addPassangerTransaction,
  isPending: addPassangerTransactionPendig,
} = useSendAndConfirmTransaction();
const {
  mutateAsync: setTicketsPriceTransaction,
  isPending: ticketsPriceTransactionPending,
} = useSendAndConfirmTransaction();

const getTimes = async ()=>{
  const currentTime =await readContract({
    contract:getTransitContract(transitContractAddress),
    method:'currentBusArrivalTime'
  })
  console.log('currentTime : ',currentTime)
  setContractCurrentTime(String(currentTime))
  const nextTime =await readContract({
    contract:getTransitContract(transitContractAddress),
    method:'nextBusArrivalTime'
  })
  console.log('nextTime : ',nextTime)

  setContractNextTime(String(nextTime))
}

const addPassengerToBus= async ()=>{
  if(ticketId){
    const transaction = prepareContractCall({
      contract:getTransitContract(transitContractAddress),
      method:'addPassenger',
      params:[ticketId]
    })
    await addPassangerTransaction(transaction as PreparedTransaction,{
      async onSuccess(){
        toast.success('Passanger added')
        await getPassangerCount()
        await getTicketsIds()
      },
      onError(){
        toast.error('Invalid Ticket')
      }
    })
  }
  else{
    toast.error('enter ticket id')
  }
}

const setTicketsPriceFunc = async ()=>{
  const transaction = prepareContractCall({
    contract:getTransitContract(transitContractAddress),
    method:'setTicketPrice',
    params:[BigInt(toUnits(ticketPrice,18))]
  })
  await setTicketsPriceTransaction(transaction as PreparedTransaction,{
    async onSuccess(){
      toast.success('Price Set for tickets')
      await getTicketPrice()
    }
  })
}
const getYourTicketId =async ()=>{
  if(activeAccount?.address){
    const yourTicketId =await readContract({
      contract:getTransitContract(transitContractAddress),
      method:'userTickets',
      params:[activeAccount?.address]
    })
    setYourTicketId(yourTicketId)
  }
  else{
    toast.error('Connect Your Wallet')
    setYourTicketId(BigInt(0))
  }
 
}
const buyTicket = async ()=>{
  if(Number(balanceData?.value)>=Number(ticketCurrentPrice)){
    const transaction = prepareContractCall({
      contract:getTransitContract(transitContractAddress),
      method:'buyTicket',
      value:ticketCurrentPrice
    })
    await buyTicketTransaction(transaction as PreparedTransaction,{
      async onSuccess(){
        toast.success('Price Set for tickets')
        await getTicketPrice()
      }
    })
  }
  else{
    toast.error('Not enough balance')
  }
 
}
const getTicketPrice = async ()=>{
  const ticketPrice =await readContract({
    contract:getTransitContract(transitContractAddress),
    method:'ticketPrice',
  })
  setTicketCurrentPrice( ticketPrice)

}
const getPassangerCount = async ()=>{
  const ticketPrice =await readContract({
    contract:getTransitContract(transitContractAddress),
    method:'passengerCount',
  })
  setPassangerCount( ticketPrice)

}
const getTicketsIds=async ()=>{
  const ticketIds =await readContract({
    contract:getTransitContract(transitContractAddress),
    method:'getTicketIds'
  })
  console.log('tickets:',ticketIds)
  setTicketsArray(ticketIds)

}
const resetBus = async ()=>{
  const transaction = prepareContractCall({
    contract:getTransitContract(transitContractAddress),
    method:'resetBus',

  })
  await startNewBusTransaction(transaction as PreparedTransaction,{
    async onSuccess(){
      await getTicketPrice()
      await getPassangerCount()
      await getTicketsIds()
      toast.success('New Bus Arived')
    }
  })
}
const genrateTickets = async ()=>{
  const transaction = prepareContractCall({
    contract:getTransitContract(transitContractAddress),
    method:'generateRandomNumbers',

  })
  await genrateTicketTransaction(transaction as PreparedTransaction,{
    onSuccess(){
      toast.success('Tickets Genrated')
    }
  })
}

const withdrawFunds = async ()=>{
  try{
    const transaction = prepareContractCall({
      contract:getTransitContract(transitContractAddress),
      method:'withdrawFunds',
  
    })
    await withdrawFundsTransaction(transaction as PreparedTransaction,{
      onSuccess(){
        toast.success('Funds Withdrawn')
      },
      
    })

  }
  catch(e){

    toast.error('No funds to withdraw')
  }
  
}
const setTimes = async ()=>{
  try{
    const transaction = prepareContractCall({
      contract:getTransitContract(transitContractAddress),
      method:'setBusArivalTime',
      params:[BigInt(currentBusArivalTime),BigInt(nextBusArivalTime)]
  
    })
    await arivalTimeTransaction(transaction as PreparedTransaction,{
      onSuccess(){
        toast.success('Arrival Time Set')
      },
      
    })
  }
  catch(e){
    console.log(e)
    toast.error('No funds to withdraw')
  }
  
}
  useEffect(() => {
    checkAdmin()
    getTicketPrice()
    getPassangerCount()
    getTicketsIds()
  }, [activeAccount?.address])
  
  return (
   <div className=" flex flex-col items-center justify-center w-full align-middle mt-10">
    {
      isAdmin ? 
      <div className="flex flex-col gap-5 w-full">
            <h1>Operator Portal</h1>
            <div className="flex flex-col gap-5">
              <h1>Set Tciket Price</h1>
              <div className="flex flex-row gap-5 w-full">
              <Input
              label='Ticket Price'
              type="number"
              variant="flat"
              name="Ticket Price"
              onChange={(e)=>{
                setTicketPrice(e.target.value)
              }}
              />
              <Button isDisabled={Number(ticketPrice)<=0} onClick={async ()=>await setTicketsPriceFunc()} isLoading={ticketsPriceTransactionPending}>Set Ticket Price</Button>
              </div>
              <h1>Ticket Price : {ticketCurrentPrice&& toEther(ticketCurrentPrice)}</h1>
              <div className="flex flex-col">
                <h1>Set Arrival Times</h1>
                <div className="flex flex-row justify-center gap-20">
                  <div>
                <Input color="secondary" label="Current Bus" value={currentBusArivalTime} onChange={(e)=>setCurrentBusArrivalTime(e.target.value)} />
       
        </div>
        <div>
        <Input label="Current Bus" color="secondary" value={nextBusArivalTime} onChange={(e)=>setNextBusArrivalTime(e.target.value)} />
        
        </div>

                </div>
                <Button onClick={async ()=>await setTimes()} isLoading={arivalTimeTransactionPending}>Set Time</Button>
              </div>
              <h1>Genrate Tickets</h1>
              <Button isLoading={genrateTransactionPending} isDisabled={activeAccount?.address==undefined} onClick={async ()=>{await genrateTickets()}}>Genrate Tickets</Button>
              <Button onClick={async ()=>{await getTicketsIds()}}>Get Tickets</Button>
              <h1>Tickets : </h1>
              {ticketsArray&& ticketsArray?.length > 0 ? 
             <div className="flex flex-wrap gap-2">
                {ticketsArray.map((ticket,index)=>(
                  <p className=" text-sm" key={index}>{String(ticket)}</p>
                ))}
              </div>
              
              :''  
            }
            <div className="flex flex-row">
              <h1>Set Arival Times</h1>
            <Input
              label='Add Passanger'
              type="number"
              variant="flat"
              name="Add Passanger"
              onChange={(e)=>{
                setTicketId(BigInt(e.target.value))
              }}
              />
              <Button isDisabled={!ticketId} onClick={async ()=>await addPassengerToBus()} isLoading={addPassangerTransactionPendig}>Add Passanger</Button>
            </div>
            <div>
              <h1>Passanger count :{String(passangerCount)} </h1>
            </div>
            </div>
            <Button color="danger" isLoading={newBusPending} onClick={async ()=>await resetBus()}>New Bus</Button>
            <Button color="primary" isLoading={withdrawFundsTransactionPending} onClick={async ()=>await withdrawFunds()}>Withdraw Funds</Button>
      </div>
      :
      <div className="flex flex-col gap-5">
      <h1>Passanger Portal </h1>
      <div className="flex flex-col gap-10">
             
                <div className="flex flex-col gap-2">
                <h1>Current Bus Arrival Time : {contractNextTime&&new Date(Number(contractCurrentTime)*1000).toUTCString()}</h1>
                <h1>Next Bus Arrival Time : {contractNextTime&&new Date(Number(contractNextTime)*1000).toUTCString()}</h1>
                <Button onClick={async ()=>await getTimes()}>Bus Timings</Button>
                </div>
                <div className="flex flex-col gap-5">
                  <h1>Ticket Price : {ticketCurrentPrice&&String(toEther(ticketCurrentPrice))}</h1>
                  <Button isLoading={buyTicketTransactionPending} onClick={async ()=>await buyTicket() }>Buy Ticket</Button>
                </div>
                <div className="flex flex-col gap-5">
                  <Button onClick={async ()=>await getYourTicketId()}>Get Your Ticket ID</Button>
                  <h1>Your Ticket ID : {String(yourTicketId)} </h1>
                </div>

              
      </div>

</div>
    }
        
   </div>
  );
}