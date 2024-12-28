export const categoryData = {
    'Food & Dining': {
      'Restaurants': '100-1000-0000',
      'Fine Dining': '100-1000-0002',
      'Take-Out & Delivery': '100-1000-0003',
      'Fast Food': '100-1000-0009',
      'Coffee Shops': '100-1100-0010',
      'Tea Houses': '100-1100-0331',
      'Bars & Pubs': '200-2000-0011',
      'Bakeries': '600-6300-0244'
    },
    'Accommodation': {
      'Hotels': '500-5000-0053',
      'Motels': '500-5000-0054',
      'Campgrounds': '500-5100-0056',
      'Bed & Breakfast': '500-5100-0058',
      'Hostels': '500-5100-0055'
    },
    'Entertainment & Culture': {
      'Cinemas': '200-2100-0019',
      'Theaters': '200-2200-0000',
      'Casinos': '200-2300-0021',
      'Concert Venues': '200-2200-0020',
      'Museums': '300-3100-0000',
      'Art Galleries': '300-3000-0024',
      'Historical Monuments': '300-3000-0025',
      'Religious Places': '300-3200-0000',
      'Wineries': '300-3000-0065',
      'Breweries': '300-3000-0350'
    },
    'Outdoor & Recreation': {
      'Parks': '550-5510-0202',
      'Beaches': '550-5510-0205',
      'Recreation Centers': '550-5510-0206',
      'Scenic Points': '550-5510-0242',
      'Campsites': '550-5510-0378',
      'Amusement Parks': '550-5520-0207',
      'Water Parks': '550-5520-0357',
      'Ski Resorts': '550-5520-0212',
      'Zoos': '550-5520-0208',
      'Aquariums': '550-5520-0211'
    },
    'Shopping': {
      'Shopping': ['600-6100-0062', '600-6200-0063', '600-6000-0061', '600-6300-0066'],
      'Shopping Malls': '600-6100-0062',
      'Department Stores': '600-6200-0063',
      'Convenience Stores': '600-6000-0061',
      'Grocery Stores': '600-6300-0066',
      'Wine & Liquor': '600-6300-0068',
      'Bookstores': '600-6700-0087',
      'Clothing & Accessories': '600-6800-0000',
      'Hardware & Garden': '600-6600-0000'
    },
    'Transportation': {
      'Airports': '400-4000-4581',
      'Train Stations': '400-4100-0035',
      'Bus Stations': '400-4100-0036',
      'Local Transit': '400-4100-0043',
      'Bike Sharing': '400-4100-0347',
      'Rest Areas': '400-4300-0000',
      'Parking': '800-8500-0000'
    },
    'Services': {
      'Banks': '700-7000-0107',
      'ATMs': '700-7010-0108',
      'Post Offices': '700-7450-0114',
      'Gas Stations': '700-7600-0000',
      'Car Repair': '700-7850-0000',
      'Car Rental': '700-7851-0117',
      'Hair & Beauty': '600-6950-0000',
      'Pharmacies': '600-6400-0000'
    },
    'Nature & Geography': {
      'Bodies of Water': '350-3500-0233',
      'Mountains & Hills': '350-3510-0236',
      'Forests': '350-3522-0239',
      'Natural Features': '350-3550-0336',
    },
    'Public Services': {
      'Hospitals': '800-8000-0000',
      'Police Stations': '700-7300-0111',
      'Libraries': '800-8300-0175',
      'Schools': '800-8250-0000',
      'Government Offices': '800-8100-0000',
      'Event Spaces': '800-8400-0000',
      'Sports Facilities': '800-8600-0000'
    }
  };
  
  // Function to get category code from display name
export const getCategoryCode = (displayName) => {
    for (const category of Object.values(categoryData)) {
      if (category[displayName]) {
        return category[displayName];
      }
    }
    return null;
};