export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-600 text-sm mb-4 md:mb-0">
            © 2025 Student Council Voting DApp. Built on Ethereum Sepolia.
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://sepolia.etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-600 text-sm transition-colors duration-200"
            >
              Etherscan
            </a>
            <a
              href="https://www.alchemy.com/faucets/ethereum-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-600 text-sm transition-colors duration-200"
            >
              Sepolia Faucet
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
