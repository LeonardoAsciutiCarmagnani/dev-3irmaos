import { ThreeDots } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center z-50">
      <ThreeDots
        visible={true}
        height="80"
        width="80"
        color="#fb2c36"
        radius="9"
        ariaLabel="three-dots-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default Loader;
