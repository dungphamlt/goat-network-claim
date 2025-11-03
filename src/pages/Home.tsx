import Header from "../components/Header";
import Content from "../components/Content";

function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <Content />
    </div>
  );
}

export default Home;
