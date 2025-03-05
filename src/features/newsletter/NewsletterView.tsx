import { useParams } from 'react-router-dom';

export const NewsletterView = () => {
  // Get the UUID from the URL parameters
  const { uuid } = useParams<{ uuid: string }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Newsletter UUID</h1>
        <p className="text-xl">{uuid}</p>
      </div>
    </div>
  );
}; 