"use client"
import React, { useEffect, useState } from 'react'
import useLoading from './useLoading';
import { useParams } from 'next/navigation';
import { fetchUserToken } from '@/lib/fetchUserToken';

const jobFetchUseEffcetHook = () => {
    const { id } = useParams();
      const { loading, setLoading } = useLoading();
    
      const [job, setJob] = useState(null);
    
      useEffect(() => {
        const loadJob = async () => {
          try {
            setLoading(true);
    
            const token = await fetchUserToken();
    
            const response = await fetch(`/api/employer/job/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
    
            if (!response.ok) {
              throw new Error("Failed to fetch job details.");
            }
    
            const data = await response.json();
    
            setJob(data.job);
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        };
    
        if (id) {
          loadJob();
        }
      }, [id, setLoading]);
    
  return {loading,job};
}

export default jobFetchUseEffcetHook