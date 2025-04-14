import { FallingLines } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <FallingLines
        color="oklch(25.8% 0.092 26.042)"
        width="100"
        visible={true}
      />
    </div>
  );
};

export default Loader;
