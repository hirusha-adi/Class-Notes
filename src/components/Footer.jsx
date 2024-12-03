import { Facebook, Youtube, Github } from "react-bootstrap-icons";

const Footer = () => {

  return (
    <>
      <footer className="footer footer-center bg-base-200 text-base-content rounded p-10">
        <nav className="grid grid-flow-col gap-4">
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Jobs</a>
          <a className="link link-hover">Press kit</a>
        </nav>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a>
              <Facebook className="text-2xl" />
            </a>
            <a>
              <Youtube className="text-2xl" />
            </a>
            <a>
              <Github className="text-2xl" />
            </a>
          </div>
        </nav>
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All right reserved by Lanka Online School.</p>
        </aside>
      </footer>
    </>
  );
};

export { Footer }