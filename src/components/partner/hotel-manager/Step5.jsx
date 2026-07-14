"use client";

import React, { useState } from 'react';
import { storage, ref, uploadBytes, getDownloadURL } from "@/lib/firebasePartner"; // Import necessary Firebase functions

function Step5({ formData, setFormData }) {
  console.log(formData)
  const [images, setImages] = useState(formData?.photosAndVideos?.images || []);
  const [uploading, setUploading] = useState(false);

  // Function to handle file upload
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    setUploading(true);

    try {
      // Upload each file to Firebase Storage and get download URLs
      const uploadedImages = await Promise.all(
        files.map((file) => {
          const fileRef = ref(storage, `property-images/${file.name}`); // Reference to where the image will be stored
          return uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef)); // Upload and get download URL
        })
      );

      // Add the download URLs of uploaded images to the state
      setImages((prevImages = []) => [...prevImages, ...uploadedImages]);

      // Save the image URLs to formData (in the 'photosAndVideos' field)
      setFormData((prevState) => ({
        ...prevState,
        photosAndVideos: {
          ...prevState.photosAndVideos,
          images: [...(prevState?.photosAndVideos?.images || []), ...uploadedImages]
        }
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // Function to remove an image from the list
  const handleRemoveImage = (index) => {
    const updatedImages = (images || []).filter((_, i) => i !== index);
    setImages(updatedImages);

    // Also remove the image from formData (in the 'photosAndVideos' field)
    setFormData((prevState) => ({
      ...prevState,
      photosAndVideos: {
        ...prevState.photosAndVideos,
        images: updatedImages
      }
    }));
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-extrabold tracking-tight text-stone-900 sm:text-xl">
        Photos &amp; videos
      </h2>
      <p className="mt-1 text-sm font-medium text-stone-500">
        Upload clear photos of your property, rooms and amenities
      </p>

      <label className="mt-5 flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-center transition hover:border-brand/50 hover:bg-orange-50/40 sm:h-56">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <span className="text-sm font-bold text-stone-600">
          {uploading ? "Uploading…" : "Click to upload images"}
        </span>
        <span className="mt-1 text-xs font-medium text-stone-400">
          JPG, PNG — multiple files supported
        </span>
      </label>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <img
              src={image}
              alt={`Property preview ${index + 1}`}
              className="h-28 w-full object-cover sm:h-32"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="w-full border-t border-stone-100 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
            >
              Remove photo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step5;
