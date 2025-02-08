// app/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  customerName: string;
  templateFile: FileList;
  image: FileList;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('customerName', data.customerName);
      formData.append('template', data.templateFile[0]);
      if (data.image[0]) {
        formData.append('image', data.image[0]);
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to generate document');

      // Get the PDF blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">PowerPoint Generator</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              PowerPoint Template (with {'{CUSTOMER}'} placeholder)
            </label>
            <input
              type="file"
              accept=".pptx"
              {...register('templateFile', { required: 'Template file is required' })}
              className="block w-full text-sm border rounded p-2"
            />
            {errors.templateFile && (
              <p className="text-red-500 text-sm mt-1">{errors.templateFile.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Customer Name
            </label>
            <input
              type="text"
              {...register('customerName', { required: 'Customer name is required' })}
              className="block w-full border rounded p-2"
              placeholder="Enter customer name"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('image')}
              className="block w-full text-sm border rounded p-2"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Generating...' : 'Generate PDF'}
          </button>
        </form>
      </div>
    </main>
  );
}
