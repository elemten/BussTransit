'use client';
import { elysiumChain } from '@/app/Header';
import { Button, Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import { createThirdwebClient } from 'thirdweb';

import { ConnectEmbed, useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
export const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow")
];
export const thirdWebClient = createThirdwebClient({ clientId: 'f76f50283af21db4ef0e6eec33b378eb' });

function ConnectWallet({widthFull}:{widthFull?:boolean}) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const activeWallet = useActiveWallet();
    const activeAccount = useActiveAccount();
    const {data}=useWalletBalance({
        client:thirdWebClient,
        chain:elysiumChain,
        address:activeAccount?.address
    })
    const walletAddress = activeAccount?.address;

  return (
    <div className='w-full'>
        {walletAddress ? 
        (
<div className=' flex flex-row gap-2'>
            <div className=' flex flex-col justify-center gap-1 items-center align-middle'>
                <h1 className='font-bold text-sm text-primary'>Balance</h1>
                <p className=' text-xs'>{Number(data?.displayValue).toFixed(2)} {data?.symbol}</p>
            </div>
        <div className=' flex flex-col justify-center items-center gap-1 align-middle'>
        <h1 className='font-bold text-sm text-primary'>Connected Wallet</h1>
        <p className=' text-xs'>{walletAddress.slice(0,4)+'...'+walletAddress.slice(39)}</p>
        </div>
        <Button
        color='danger'
        onClick={async ()=> await activeWallet?.disconnect()}
        > 
            Disconnect</Button>
        </div>
        )
        
       
        :  
        <>

        <Button 
        fullWidth={widthFull}
        onPress={()=>{
            onOpen();

        }}
        className={"border-medium border-primary text-foreground bg-primary h-12 text-md hover:bg-primary hover:text-background font-semibold  rounded-md"}
       >Connect  Wallet</Button>
       <div className="hidden">
                       <ConnectEmbed
                           autoConnect={true}
                           className="hidden"
                           client={thirdWebClient}
                           showThirdwebBranding={false}
                           showAllWallets={false}
                           chain={elysiumChain}
                       />
                   </div>    
                   </>
    }
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} className=' dark' size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody>
                                <h1 className="font-bold text-2xl text-primary">Tickets Inc.</h1>
                                <ConnectEmbed
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        padding: '0px !important',
                                        border: 'none !important',
                                        marginBottom: '10px'
                                    }}
                                    theme={'dark'}
                                    autoConnect={true}
                                    client={thirdWebClient}
                                    showThirdwebBranding={false}
                                    showAllWallets={false}

                                    wallets={wallets}
                                    chain={elysiumChain}
                                    onConnect={onClose}
                                    
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
      
    </div>
  )
}

export default ConnectWallet