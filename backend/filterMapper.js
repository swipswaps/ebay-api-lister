/**
 * Maps generic UI filters to eBay Browse API (Active) filter string
 */
export function mapBrowseApiFilters(filters) {
  const apiFilters = [];

  // Buying Options (Fixed Price vs Auction)
  // Default to both if not specified, but typically we want immediate options
  apiFilters.push('buyingOptions:{FIXED_PRICE|AUCTION}');

  // Price Constraints
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice || '0';
    const max = filters.maxPrice || '*';
    apiFilters.push(`price:[${min}..${max}]`);
  }

  // Condition
  // 1000: New, 3000: Used, 2000: Refurbished (simplified mapping)
  if (filters.conditions && filters.conditions.length > 0) {
    const conditionIds = [];
    if (filters.conditions.includes('New')) conditionIds.push('1000');
    if (filters.conditions.includes('Used')) conditionIds.push('3000');
    if (filters.conditions.includes('Refurbished')) conditionIds.push('2000|2500');
    
    if (conditionIds.length > 0) {
      apiFilters.push(`conditionIds:{${conditionIds.join('|')}}`);
    }
  }

  // Delivery Options
  if (filters.freeShipping) {
    apiFilters.push('deliveryOptions:{FREE_SHIPPING}');
  }

  return apiFilters.join(',');
}

/**
 * Maps generic UI filters to eBay Finding API (Sold) itemFilters array
 */
export function mapFindingApiFilters(filters) {
  const itemFilters = [];
  
  // Mandatory for Sold search
  itemFilters.push({ name: 'SoldItemsOnly', value: 'true' });

  // Price
  if (filters.minPrice) {
    itemFilters.push({ name: 'MinPrice', value: filters.minPrice });
  }
  if (filters.maxPrice) {
    itemFilters.push({ name: 'MaxPrice', value: filters.maxPrice });
  }

  // Condition
  // Finding API uses specific IDs: 1000=New, 3000=Used, etc.
  if (filters.conditions && filters.conditions.length > 0) {
    const values = [];
    if (filters.conditions.includes('New')) values.push('1000');
    if (filters.conditions.includes('Used')) values.push('3000');
    if (filters.conditions.includes('Refurbished')) values.push('2000', '2500');
    
    if (values.length > 0) {
      itemFilters.push({ name: 'Condition', value: values });
    }
  }

  // Shipping
  if (filters.freeShipping) {
    itemFilters.push({ name: 'FreeShippingOnly', value: 'true' });
  }

  if (filters.localPickup) {
     itemFilters.push({ name: 'LocalPickupOnly', value: 'true' });
  }

  // Seller Feedback
  if (filters.minFeedbackScore) {
    itemFilters.push({ name: 'FeedbackScoreMin', value: filters.minFeedbackScore });
  }

  return itemFilters;
}