interface PortfolioEmptyProps {
  onCreate: () => void;
}

export const PortfolioEmpty = ({ onCreate }: PortfolioEmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-4">No Portfolio Found</h2>
      <p className="text-gray-600 mb-6">Create your first portfolio to get started</p>
      <button
        onClick={onCreate}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Portfolio
      </button>
    </div>
  );
};