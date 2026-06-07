import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Backpack, Trash2, Tag } from 'lucide-react';
import type { MarketOrder, StolenData, RarityType } from '../../shared/types';
import { useGameStore } from '../stores/useGameStore';
import { cn } from '@/lib/utils';
import { formatCredits } from '../data/mockData';
import StolenDataCard from '../components/StolenDataCard';
import Empty from '../components/Empty';
import MarketOrderCard from '../components/MarketOrderCard';
import OrderDetailModal from '../components/OrderDetailModal';
import ListingModal from '../components/ListingModal';
import MarketFilterBar from '../components/MarketFilterBar';

type TabType = 'market' | 'inventory';
type SortType = 'price-asc' | 'price-desc' | 'newest';

export default function Market() {
  const { player, marketOrders, playerInventory, buyData, cancelListing, listDataForSale, isLoading } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('market');
  const [selectedOrder, setSelectedOrder] = useState<MarketOrder | null>(null);
  const [listingData, setListingData] = useState<StolenData | null>(null);
  const [listingPrice, setListingPrice] = useState(0);

  const [rarityFilter, setRarityFilter] = useState<RarityType | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(Infinity);
  const [sortBy, setSortBy] = useState<SortType>('newest');

  const listedOrders = useMemo(() => marketOrders.filter(o => o.status === 'listed'), [marketOrders]);
  const myListedOrders = useMemo(() => listedOrders.filter(o => o.sellerId === player?.id), [listedOrders, player]);

  const dataTypes = useMemo(() => {
    const types = new Set(listedOrders.map(o => o.data.type));
    return ['all', ...Array.from(types)];
  }, [listedOrders]);

  const filteredOrders = useMemo(() => {
    let orders = [...listedOrders];

    if (rarityFilter !== 'all') {
      orders = orders.filter(o => o.data.rarity === rarityFilter);
    }
    if (typeFilter !== 'all') {
      orders = orders.filter(o => o.data.type === typeFilter);
    }
    if (maxPriceFilter !== Infinity) {
      orders = orders.filter(o => o.price <= maxPriceFilter);
    }

    orders.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return orders;
  }, [listedOrders, rarityFilter, typeFilter, maxPriceFilter, sortBy]);

  const handleBuy = async (order: MarketOrder) => {
    if (!player || player.credits < order.price) return;
    const success = await buyData(order.id);
    if (success) {
      setSelectedOrder(null);
    }
  };

  const handleCancelListing = async (orderId: string) => {
    await cancelListing(orderId);
  };

  const handleOpenListing = (data: StolenData) => {
    setListingData(data);
    setListingPrice(Math.floor(data.baseValue * 1.1));
  };

  const handleConfirmListing = async () => {
    if (!listingData) return;
    const success = await listDataForSale(listingData.id, listingPrice);
    if (success) {
      setListingData(null);
    }
  };

  const priceSuggestion = listingData ? {
    avg7d: Math.floor(listingData.baseValue * 1.1),
    range: [Math.floor(listingData.baseValue * 0.9), Math.floor(listingData.baseValue * 1.3)] as [number, number],
    historicalPrices: [],
  } : null;

  const tabs = [
    { id: 'market', label: '市场', icon: ShoppingBag, count: listedOrders.length },
    { id: 'inventory', label: '我的背包', icon: Backpack, count: playerInventory.length + myListedOrders.length },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-display font-bold mb-2 neon-text-cyan">
            暗网交易市场
          </h1>
          <p className="text-cyber-muted">买卖被盗数据，积累财富</p>
          {player && (
            <div className="mt-3 flex items-center gap-4">
              <span className="text-cyber-muted">当前余额:</span>
              <span className="font-mono font-bold text-xl text-cyber-success">
                {formatCredits(player.credits)}
              </span>
            </div>
          )}
        </motion.div>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 font-display font-bold uppercase tracking-wider text-sm border-2 transition-all',
                activeTab === tab.id
                  ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary shadow-neon-cyan'
                  : 'bg-cyber-bg-card border-cyber-primary/30 text-cyber-muted hover:border-cyber-primary/50'
              )}
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              <span className="bg-cyber-bg-light px-2 py-0.5 text-xs font-mono">
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'market' ? (
            <motion.div
              key="market"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MarketFilterBar
                rarityFilter={rarityFilter}
                typeFilter={typeFilter}
                maxPriceFilter={maxPriceFilter}
                sortBy={sortBy}
                dataTypes={dataTypes}
                onRarityChange={setRarityFilter}
                onTypeChange={setTypeFilter}
                onMaxPriceChange={setMaxPriceFilter}
                onSortChange={setSortBy}
              />

              {filteredOrders.length === 0 ? (
                <Empty />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MarketOrderCard
                        order={order}
                        playerCredits={player?.credits ?? 0}
                        onClick={() => setSelectedOrder(order)}
                        onBuy={() => handleBuy(order)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {myListedOrders.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-cyber-primary" />
                    我的在售订单
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myListedOrders.map((order) => (
                      <div key={order.id} className="relative">
                        <StolenDataCard data={order.data} price={order.price} />
                        <button
                          onClick={() => handleCancelListing(order.id)}
                          disabled={isLoading}
                          className="absolute top-2 right-2 p-1.5 bg-cyber-danger/80 hover:bg-cyber-danger text-white rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-cyber-bg-card/90 px-2 py-1 text-xs font-mono text-cyber-success">
                          售价: {formatCredits(order.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                  <Backpack className="w-5 h-5 text-cyber-secondary" />
                  未上架数据
                </h2>
                {playerInventory.length === 0 ? (
                  <Empty />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playerInventory.map((data, index) => (
                      <motion.div
                        key={data.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <StolenDataCard
                          data={data}
                          showActions
                          onList={() => handleOpenListing(data)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            playerCredits={player?.credits ?? 0}
            onClose={() => setSelectedOrder(null)}
            onBuy={() => handleBuy(selectedOrder)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {listingData && priceSuggestion && (
          <ListingModal
            data={listingData}
            price={listingPrice}
            suggestion={priceSuggestion}
            onPriceChange={setListingPrice}
            onClose={() => setListingData(null)}
            onConfirm={handleConfirmListing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


