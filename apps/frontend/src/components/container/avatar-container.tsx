export interface AvatarContainerProps {
  name: string;
}

export function AvatarContainer({ name }: AvatarContainerProps) {
  // let icon = name
  //   ?.split(' ')
  //   .map((word) => word.charAt(0))
  //   .slice(0, 2) // Get the first two characters
  //   .join(''); // Join the characters into a string

  // // If there's only one word, get the first two characters
  // if (icon.length === 1 && name) {
  //   icon += name.charAt(1);
  // }

  const icon = name.charAt(0);

  return (
    <div className="avatar-name rounded-circle">
      <span>{icon}</span>
    </div>
  );
}
