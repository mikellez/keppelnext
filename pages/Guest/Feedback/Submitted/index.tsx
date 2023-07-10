import React, { useState, useEffect } from "react";
import { useRouter} from "next/router";
import TooltipBtn from "../../../../components/TooltipBtn";

const Submitted = () => {
    const router = useRouter();
    const [windowWidth, setWindowWidth] = useState<number>(0);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
      }, []);

    return <div className='pt-5 mt-5 d-flex justify-content-center' style={{fontSize: 24, 
            padding: '5rem', 
            flexDirection: 'column'}}>
        <p className='text-center my-0'>

        Thank you for your feedback. Your feedback is important to us. 
        </p>
        {/* <br /> */}
        <p className="text-center my-0">
        
        Your feedback has been submitted and we will get back to you shortly. 
        
        </p>
        <p className="text-center my-0">
        You may close this window now.
        </p>
        <div className="mt-5 d-flex align-items-center " style={{flexDirection: 'column'}}>
            <p className="text-center" style={{fontSize: 18}}>
                For internal users, you may choose to login below:
            </p>
            <TooltipBtn
                    toolTip={false}
                    onClick={() => router.push("/Login")}
                  >
                    Login
            </TooltipBtn>
        </div>
    </div>
}

export default Submitted;