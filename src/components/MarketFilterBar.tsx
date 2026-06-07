import { Filter, SortAsc } from 'lucide-react';
import type { RarityType } from '../../shared/types';

interface MarketFilterBarProps {
  rarityFilter: RarityType | 'all';
  typeFilter: string;
  maxPriceFilter: number;
  sortBy: 'price-asc' | 'price-desc' | 'newest';
  dataTypes: string[];
  onRarityChange: (value: RarityType | 'all') => void;
  onTypeChange: (value: string) => void;
  onMaxPriceChange: (value: number) => void;
  onSortChange: (value: 'price-asc' | 'price-desc' | 'newest') => void;
}

export default function MarketFilterBar({
  rarityFilter,
  typeFilter,
  maxPriceFilter,
  sortBy,
  dataTypes,
  onRarityChange,
  onTypeChange,
  onMaxPriceChange,
  onSortChange,
}: MarketFilterBarProps) {
  return (
    <div className="bg-cyber-bg-card border border-cyber-primary/30 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyber-primary" />
          <span className="text-sm text-cyber-muted">筛选:</span>
        </div>

        <select
          value={rarityFilter}
          onChange={(e) => onRarityChange(e.target.value as RarityType | 'all')}
          className="cyber-input text-sm py-1.5"
        >
          <option value="all">全部稀有度</option>
          <option value="common">普通</option>
          <option value="rare">稀有</option>
          <option value="epic">史诗</option>
          <option value="legendary">传奇</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="cyber-input text-sm py-1.5"
        >
          {dataTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? '全部类型' : type}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="最高价格"
          value={maxPriceFilter === Infinity ? '' : maxPriceFilter}
          onChange={(e) => onMaxPriceChange(e.target.value ? parseInt(e.target.value, 10) : Infinity)}
          className="cyber-input text-sm py-1.5 w-32"
        />

        <div className="flex items-center gap-2 ml-auto">
          <SortAsc className="w-4 h-4 text-cyber-muted" />
          <span className="text-sm text-cyber-muted">排序:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'price-asc' | 'price-desc' | 'newest')}
            className="cyber-input text-sm py-1.5"
          >
            <option value="newest">最新上架</option>
            <option value="price-asc">价格升序</option>
            <option value="price-desc">价格降序</option>
          </select>
        </div>
      </div>
    </div>
  );
}
