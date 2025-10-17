import TradingHeader from "@/components/TradingHeader";
import EncryptedTrading from "@/components/EncryptedTrading";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TradingHeader />
      <div className="container mx-auto px-4 py-8">
        <EncryptedTrading />
      </div>
    </div>
  );
};

export default Index;
