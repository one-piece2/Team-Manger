import { Link } from "react-router-dom";

const Logo = ({ url = "/" }: { url?: string }) => {
  return (
    <Link to={url}>
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <img src="/onepiece.png" alt="one-piece" />
      </div>
    </Link>
  );
};

export default Logo;