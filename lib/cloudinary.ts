/** Build a Cloudinary delivery URL from a public id and media type. */
export function getCloudinaryUrl(publicId: string, mediaType: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const resourceType = mediaType === "video" ? "video" : "image";
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`;
}
