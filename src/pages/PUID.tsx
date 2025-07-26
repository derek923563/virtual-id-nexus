import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VirtualIdCard from '../components/VirtualIdCard';
import { Card } from '@/components/ui/card';

const PUIDPage: React.FC = () => {
  const { puid } = useParams<{ puid: string }>();
  console.log('PUIDPage rendered, puid param:', puid);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!puid) return;
    setLoading(true);
    fetch(`/api/members/public/vid/${puid}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setMember(data);
        setError(null);
      })
      .catch(() => setError('This Virtual ID Card could not be found.'))
      .finally(() => setLoading(false));
  }, [puid]);

  if (loading) return <Card className="max-w-md mx-auto mt-10 p-6 text-center">Loading...</Card>;
  if (error) return <Card className="max-w-md mx-auto mt-10 p-6 text-center text-red-500">{error}</Card>;
  if (!member) return null;

  // Pass the member object as-is for an exact match
  return (
    <div className="mt-10">
      <VirtualIdCard member={member} showFullDetails={false} enableSharing={false} />
    </div>
  );
};

export default PUIDPage; 