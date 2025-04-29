import axios from "axios";
import config from "../../../config.js";
import {
  FugleApiResponse,
  RecentPriceVolumeData,
  StockBasicInfo,
  ImportantDates,
  NewsItem,
  CompanyProfile,
  MonthlyRevenueItem,
  AutocompleteTerms,
} from "../types.js";

/**
 * Provider for Fugle API interactions
 */
class FugleApiProvider {
  private static instance: FugleApiProvider;
  private apiClient: ReturnType<typeof axios.create>;

  private constructor() {
    this.apiClient = axios.create({
      baseURL: config.fugle.apiUrl,
    });
  }

  /**
   * Get singleton instance of FugleApiProvider
   */
  public static getInstance(): FugleApiProvider {
    if (!FugleApiProvider.instance) {
      FugleApiProvider.instance = new FugleApiProvider();
    }
    return FugleApiProvider.instance;
  }

  /**
   * 獲取近3日價量數據 (FCNT000013)
   */
  async getRecentPriceVolume(
    symbolId: string
  ): Promise<RecentPriceVolumeData[]> {
    try {
      const response = await this.apiClient.get<
        FugleApiResponse<RecentPriceVolumeData[]>
      >(`/data/contents/FCNT000013`, {
        params: { symbol_id: symbolId },
      });
      return response.data.data.content.rawContent;
    } catch (error) {
      console.error(
        `Error fetching recent price volume data for ${symbolId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * 獲取商品基本資料 (FCNT000017)
   */
  async getStockBasicInfo(symbolId: string): Promise<StockBasicInfo> {
    try {
      const response = await this.apiClient.get<
        FugleApiResponse<StockBasicInfo>
      >(`/data/contents/FCNT000017`, {
        params: { symbol_id: symbolId },
      });
      return response.data.data.content.rawContent;
    } catch (error) {
      console.error(`Error fetching stock basic info for ${symbolId}:`, error);
      throw error;
    }
  }

  /**
   * 獲取最近重要日期 (FCNT000137)
   */
  async getImportantDates(symbolId: string): Promise<ImportantDates> {
    try {
      const response = await this.apiClient.get<
        FugleApiResponse<ImportantDates>
      >(`/data/contents/FCNT000137`, {
        params: { symbol_id: symbolId },
      });
      return response.data.data.content.rawContent;
    } catch (error) {
      console.error(`Error fetching important dates for ${symbolId}:`, error);
      throw error;
    }
  }

  /**
   * 獲取重大訊息 (FCNT000004)
   */
  async getImportantNews(symbolId: string): Promise<NewsItem[]> {
    try {
      const response = await this.apiClient.get<FugleApiResponse<NewsItem[]>>(
        `/data/contents/FCNT000004`,
        {
          params: { symbol_id: symbolId },
        }
      );
      return response.data.data.content.rawContent;
    } catch (error) {
      console.error(`Error fetching important news for ${symbolId}:`, error);
      throw error;
    }
  }

  /**
   * 獲取公司基本資料 (FCNT000001)
   */
  async getCompanyProfile(symbolId: string): Promise<CompanyProfile> {
    try {
      const response = await this.apiClient.get<
        FugleApiResponse<CompanyProfile>
      >(`/data/contents/FCNT000001`, {
        params: { symbol_id: symbolId },
      });
      return response.data.data.content.rawContent;
    } catch (error) {
      console.error(`Error fetching company profile for ${symbolId}:`, error);
      throw error;
    }
  }

  /**
   * 獲取近5年營收 (FCNT000006)
   */
  async getMonthlyRevenue(symbolId: string): Promise<MonthlyRevenueItem[]> {
    try {
      const response = await this.apiClient.get<
        FugleApiResponse<MonthlyRevenueItem[]>
      >(`/data/contents/FCNT000006`, {
        params: { symbol_id: symbolId },
      });
      return response.data.data.content.rawContent;
    } catch (error) {
      console.error(`Error fetching monthly revenue for ${symbolId}:`, error);
      throw error;
    }
  }

  /**
   * 獲取近5年營收 (FCNT000006)
   */
  async getAutocompleteTerms(terms: string): Promise<AutocompleteTerms> {
    try {
      const response = await this.apiClient.get<AutocompleteTerms>(
        `/autocomplete/terms?q=${terms}`
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching autocomplete terms for ${terms}:`, error);
      throw error;
    }
  }

  /**
   * Check if the connection to Fugle API is working
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Try to get an index data to check if the API is accessible
      await this.getRecentPriceVolume("IX0001");
      return true;
    } catch (error) {
      console.error("Fugle API health check failed:", error);
      return false;
    }
  }
}

export default FugleApiProvider;
