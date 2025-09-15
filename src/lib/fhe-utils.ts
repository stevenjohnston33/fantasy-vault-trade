import { createFhevmInstance } from 'fhevmjs';

export class FHEUtils {
  private static instance: any = null;

  static async getInstance() {
    if (!this.instance) {
      this.instance = await createFhevmInstance();
    }
    return this.instance;
  }

  static async encryptAmount(
    value: number,
    contractAddress: string,
    userAddress: string
  ): Promise<{ encryptedData: string; inputProof: string }> {
    try {
      const instance = await this.getInstance();
      
      // Encrypt the value
      const encryptedData = instance.encrypt32(value);
      
      // Generate input proof
      const inputProof = await instance.generateInputProof({
        input: encryptedData,
        publicKey: instance.getPublicKey(contractAddress),
        signature: instance.getPublicKey(contractAddress),
      });

      return {
        encryptedData: encryptedData,
        inputProof: inputProof,
      };
    } catch (error) {
      console.error('Error encrypting amount:', error);
      throw new Error('Failed to encrypt amount');
    }
  }

  static async encryptPrice(
    price: number,
    contractAddress: string,
    userAddress: string
  ): Promise<{ encryptedData: string; inputProof: string }> {
    return this.encryptAmount(price, contractAddress, userAddress);
  }

  static async encryptQuantity(
    quantity: number,
    contractAddress: string,
    userAddress: string
  ): Promise<{ encryptedData: string; inputProof: string }> {
    return this.encryptAmount(quantity, contractAddress, userAddress);
  }

  static async encryptScore(
    score: number,
    contractAddress: string,
    userAddress: string
  ): Promise<{ encryptedData: string; inputProof: string }> {
    return this.encryptAmount(score, contractAddress, userAddress);
  }

  static async decryptResult(
    encryptedResult: string,
    contractAddress: string
  ): Promise<number> {
    try {
      const instance = await this.getInstance();
      const decrypted = instance.decrypt(encryptedResult, contractAddress);
      return Number(decrypted);
    } catch (error) {
      console.error('Error decrypting result:', error);
      throw new Error('Failed to decrypt result');
    }
  }

  static async generateTradingProof(
    orderData: {
      quantity: number;
      price: number;
      isBuy: boolean;
    },
    contractAddress: string,
    userAddress: string
  ): Promise<{
    encryptedQuantity: string;
    encryptedPrice: string;
    inputProof: string;
  }> {
    try {
      const [quantityResult, priceResult] = await Promise.all([
        this.encryptQuantity(orderData.quantity, contractAddress, userAddress),
        this.encryptPrice(orderData.price, contractAddress, userAddress),
      ]);

      return {
        encryptedQuantity: quantityResult.encryptedData,
        encryptedPrice: priceResult.encryptedData,
        inputProof: quantityResult.inputProof, // Use quantity proof as main proof
      };
    } catch (error) {
      console.error('Error generating trading proof:', error);
      throw new Error('Failed to generate trading proof');
    }
  }

  static async generatePortfolioProof(
    portfolioData: {
      totalValue: number;
      totalPnl: number;
      tradeCount: number;
    },
    contractAddress: string,
    userAddress: string
  ): Promise<{
    encryptedValue: string;
    encryptedPnl: string;
    encryptedCount: string;
    inputProof: string;
  }> {
    try {
      const [valueResult, pnlResult, countResult] = await Promise.all([
        this.encryptAmount(portfolioData.totalValue, contractAddress, userAddress),
        this.encryptAmount(portfolioData.totalPnl, contractAddress, userAddress),
        this.encryptAmount(portfolioData.tradeCount, contractAddress, userAddress),
      ]);

      return {
        encryptedValue: valueResult.encryptedData,
        encryptedPnl: pnlResult.encryptedData,
        encryptedCount: countResult.encryptedData,
        inputProof: valueResult.inputProof, // Use value proof as main proof
      };
    } catch (error) {
      console.error('Error generating portfolio proof:', error);
      throw new Error('Failed to generate portfolio proof');
    }
  }

  static async generateLeaderboardProof(
    score: number,
    contractAddress: string,
    userAddress: string
  ): Promise<{
    encryptedScore: string;
    inputProof: string;
  }> {
    try {
      const scoreResult = await this.encryptScore(score, contractAddress, userAddress);

      return {
        encryptedScore: scoreResult.encryptedData,
        inputProof: scoreResult.inputProof,
      };
    } catch (error) {
      console.error('Error generating leaderboard proof:', error);
      throw new Error('Failed to generate leaderboard proof');
    }
  }

  static async validateEncryption(
    encryptedData: string,
    expectedValue: number,
    contractAddress: string
  ): Promise<boolean> {
    try {
      const decrypted = await this.decryptResult(encryptedData, contractAddress);
      return Math.abs(decrypted - expectedValue) < 0.001; // Allow for small floating point differences
    } catch (error) {
      console.error('Error validating encryption:', error);
      return false;
    }
  }

  static async initializeFHE() {
    try {
      const instance = await this.getInstance();
      console.log('FHE instance initialized successfully');
      return instance;
    } catch (error) {
      console.error('Error initializing FHE:', error);
      throw new Error('Failed to initialize FHE');
    }
  }
}
