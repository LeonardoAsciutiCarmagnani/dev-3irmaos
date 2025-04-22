import { Puff } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center z-50">
      <Puff
        visible={true}
        height="80"
        width="80"
        color="oklch(27.9% 0.041 260.031)"
        ariaLabel="puff-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default Loader;
