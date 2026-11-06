import { Label } from "@/components/ui/label";

interface ImageUploadLabelProps {
  htmlFor: string;
  label: string;
  pixelSize: string;
  millimeterSize: string;
}

export function ImageUploadLabel({
  htmlFor,
  label,
  pixelSize,
  millimeterSize,
}: ImageUploadLabelProps) {
  return (
    <Label
      htmlFor={htmlFor}
      className="flex flex-wrap items-center gap-x-2 gap-y-1"
    >
      <span>{label}</span>
      <span className="text-xs font-normal text-muted-foreground">
        Recommended: {pixelSize} px ({millimeterSize} mm)
      </span>
    </Label>
  );
}
