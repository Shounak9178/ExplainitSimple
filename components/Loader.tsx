
import React from 'react';
import { LoaderIcon } from './IconComponents';

interface LoaderProps {
  text: string;
}

export const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <LoaderIcon className="h-12 w-12 animate-spin text-cyan-400 mb-4" />
      <p className="text-lg text-slate-300 font-medium">{text}</p>
    </div>
  );
};
