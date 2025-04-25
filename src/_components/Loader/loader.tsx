import { Puff } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center z-50">
      <Puff
        visible={true}
        height="80"
        width="80"
        color="oklch(39.6% 0.141 25.723)"
        ariaLabel="puff-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default Loader;
