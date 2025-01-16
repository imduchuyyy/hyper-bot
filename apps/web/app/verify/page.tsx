'use client'

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";


const VerifyPage = () => {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  const fetchUserInfo = async () => {
    const response = await fetch(`/api/verify?userId=${userId}`)
    const data = await response.json()
    console.log(data)
  }

  useEffect(() => {
    fetchUserInfo()
  }, [userId])

  return (
    <div>
      <div>Verify</div>
    </div>
  );
};

export default VerifyPage