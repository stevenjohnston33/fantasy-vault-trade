import TradingHeader from "@/components/TradingHeader";
import TradingDashboard from "@/components/TradingDashboard";
import { EncryptedTrading } from "@/components/EncryptedTrading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TradingHeader />
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Trading Dashboard</TabsTrigger>
            <TabsTrigger value="encrypted">FHE Encrypted Trading</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <TradingDashboard />
          </TabsContent>
          <TabsContent value="encrypted" className="mt-6">
            <EncryptedTrading />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
