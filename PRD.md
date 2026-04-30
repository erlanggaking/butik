# Product Requirements Document (PRD): AI-Based Inventory & Consignment System for Boutique

## 1. Ringkasan Eksekutif
Sistem ini dirancang khusus untuk operasional **Butik High-End** yang mengelola perpaduan stok beli putus (Regular) dan titip jual (Consignment). Dengan integrasi AI, sistem tidak hanya mencatat transaksi, tetapi juga memberikan rekomendasi strategis untuk optimasi inventaris dan profitabilitas per brand.

## 2. Arsitektur Database (Schema Design)
Sistem menggunakan database relasional (PostgreSQL) untuk integritas data yang ketat.

### 2.1. Tabel Utama
- **`brands`**: Menyimpan data vendor/brand, tipe kerjasama, dan persentase bagi hasil (commission_rate).
- **`products`**: Master data produk (SKU, Nama, Kategori, BrandID, Size, Color, BasePrice, SellingPrice).
- **`inventory`**: Pencatatan stok real-time per lokasi penyimpanan (Warehouse vs Front-store).
- **`transactions`**: Header penjualan (Timestamp, TotalAmount, PaymentMethod, Channel).
- **`transaction_items`**: Detail item terjual, COGS saat transaksi, dan margin yang didapat.
- **`settlements`**: Rekam jejak pembayaran ke brand konsinyasi.

### 2.2. Entity Relationship Diagram (Conceptual)
`Brands (1) <--- (N) Products (1) <--- (N) Inventory`  
`Products (1) <--- (N) Transaction_Items (N) ---> (1) Transactions`

## 3. Fitur Utama & Logic Bisnis
### 3.1. Manajemen Inventaris Pintar
- **Multi-Type Tracking**: Sistem secara otomatis membedakan arus kas antara stok Regular (aset) dan Consignment (liabilitas hingga terjual).
- **Automated COGS**: Menggunakan metode *Weighted Average* untuk akurasi nilai buku butik.

### 3.2. AI Analytics Insights
- **Slow-Moving Predictor**: AI menganalisis barang yang tidak bergerak lebih dari 30 hari dan memberikan label "Clearance Candidate".
- **Demand Forecasting**: Memprediksi kebutuhan restock berdasarkan tren musiman butik (misal: kenaikan permintaan Dress menjelang musim pesta).
- **Brand Performance Index**: Memberikan skor (1-100) bagi tiap brand berdasarkan kecepatan perputaran stok dan margin kontribusi.

## 4. Saran Implementasi Terbaik (Best Practices)
1. **Integrasi RFID**: Untuk butik, penggunaan barcode manual seringkali lambat. Gunakan RFID untuk *stock opname* instan dalam hitungan detik.
2. **Dynamic Pricing for Consignment**: Fitur untuk otomatis menurunkan harga (mark-down) pada barang konsinyasi yang sudah terlalu lama di display (sesuai perjanjian dengan brand).
3. **WhatsApp Notification Engine**: Notifikasi otomatis ke owner saat ada brand yang mencapai target penjualan harian.

## 5. Master Data & Dummy Data (20 Brand, 10 Stok/Item)
Berikut adalah cuplikan data awal untuk sistem:


| Brand             | SKU         | Item Name                                   | Category    |   Qty |   Cost Price (IDR) |   Selling Price (IDR) | Type        | Location             |
|:------------------|:------------|:--------------------------------------------|:------------|------:|-------------------:|----------------------:|:------------|:---------------------|
| Chanel            | CHA-HAN-101 | Chanel Handbag Collection 1                 | Handbag     |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-SHO-102 | Chanel Shoes Collection 2                   | Shoes       |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-ACC-103 | Chanel Accessories Collection 3             | Accessories |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-OUT-104 | Chanel Outerwear Collection 4               | Outerwear   |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-DRE-105 | Chanel Dress Collection 5                   | Dress       |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-HAN-106 | Chanel Handbag Collection 6                 | Handbag     |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-SHO-107 | Chanel Shoes Collection 7                   | Shoes       |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-ACC-108 | Chanel Accessories Collection 8             | Accessories |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-OUT-109 | Chanel Outerwear Collection 9               | Outerwear   |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf A |
| Chanel            | CHA-DRE-110 | Chanel Dress Collection 10                  | Dress       |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf A |
| Dior              | DIO-SHO-101 | Dior Shoes Collection 1                     | Shoes       |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-ACC-102 | Dior Accessories Collection 2               | Accessories |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-OUT-103 | Dior Outerwear Collection 3                 | Outerwear   |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-DRE-104 | Dior Dress Collection 4                     | Dress       |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-HAN-105 | Dior Handbag Collection 5                   | Handbag     |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-SHO-106 | Dior Shoes Collection 6                     | Shoes       |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-ACC-107 | Dior Accessories Collection 7               | Accessories |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-OUT-108 | Dior Outerwear Collection 8                 | Outerwear   |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-DRE-109 | Dior Dress Collection 9                     | Dress       |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf B |
| Dior              | DIO-HAN-110 | Dior Handbag Collection 10                  | Handbag     |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf B |
| Louis Vuitton     | LOU-ACC-101 | Louis Vuitton Accessories Collection 1      | Accessories |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-OUT-102 | Louis Vuitton Outerwear Collection 2        | Outerwear   |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-DRE-103 | Louis Vuitton Dress Collection 3            | Dress       |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-HAN-104 | Louis Vuitton Handbag Collection 4          | Handbag     |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-SHO-105 | Louis Vuitton Shoes Collection 5            | Shoes       |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-ACC-106 | Louis Vuitton Accessories Collection 6      | Accessories |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-OUT-107 | Louis Vuitton Outerwear Collection 7        | Outerwear   |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-DRE-108 | Louis Vuitton Dress Collection 8            | Dress       |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-HAN-109 | Louis Vuitton Handbag Collection 9          | Handbag     |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf C |
| Louis Vuitton     | LOU-SHO-110 | Louis Vuitton Shoes Collection 10           | Shoes       |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf C |
| Gucci             | GUC-OUT-101 | Gucci Outerwear Collection 1                | Outerwear   |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-DRE-102 | Gucci Dress Collection 2                    | Dress       |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-HAN-103 | Gucci Handbag Collection 3                  | Handbag     |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-SHO-104 | Gucci Shoes Collection 4                    | Shoes       |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-ACC-105 | Gucci Accessories Collection 5              | Accessories |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-OUT-106 | Gucci Outerwear Collection 6                | Outerwear   |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-DRE-107 | Gucci Dress Collection 7                    | Dress       |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-HAN-108 | Gucci Handbag Collection 8                  | Handbag     |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-SHO-109 | Gucci Shoes Collection 9                    | Shoes       |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf D |
| Gucci             | GUC-ACC-110 | Gucci Accessories Collection 10             | Accessories |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf D |
| Prada             | PRA-DRE-101 | Prada Dress Collection 1                    | Dress       |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-HAN-102 | Prada Handbag Collection 2                  | Handbag     |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-SHO-103 | Prada Shoes Collection 3                    | Shoes       |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-ACC-104 | Prada Accessories Collection 4              | Accessories |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-OUT-105 | Prada Outerwear Collection 5                | Outerwear   |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-DRE-106 | Prada Dress Collection 6                    | Dress       |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-HAN-107 | Prada Handbag Collection 7                  | Handbag     |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-SHO-108 | Prada Shoes Collection 8                    | Shoes       |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-ACC-109 | Prada Accessories Collection 9              | Accessories |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf E |
| Prada             | PRA-OUT-110 | Prada Outerwear Collection 10               | Outerwear   |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf E |
| Hermès            | HER-HAN-101 | Hermès Handbag Collection 1                 | Handbag     |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-SHO-102 | Hermès Shoes Collection 2                   | Shoes       |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-ACC-103 | Hermès Accessories Collection 3             | Accessories |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-OUT-104 | Hermès Outerwear Collection 4               | Outerwear   |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-DRE-105 | Hermès Dress Collection 5                   | Dress       |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-HAN-106 | Hermès Handbag Collection 6                 | Handbag     |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-SHO-107 | Hermès Shoes Collection 7                   | Shoes       |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-ACC-108 | Hermès Accessories Collection 8             | Accessories |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-OUT-109 | Hermès Outerwear Collection 9               | Outerwear   |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf A |
| Hermès            | HER-DRE-110 | Hermès Dress Collection 10                  | Dress       |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf A |
| Saint Laurent     | SAI-SHO-101 | Saint Laurent Shoes Collection 1            | Shoes       |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-ACC-102 | Saint Laurent Accessories Collection 2      | Accessories |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-OUT-103 | Saint Laurent Outerwear Collection 3        | Outerwear   |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-DRE-104 | Saint Laurent Dress Collection 4            | Dress       |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-HAN-105 | Saint Laurent Handbag Collection 5          | Handbag     |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-SHO-106 | Saint Laurent Shoes Collection 6            | Shoes       |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-ACC-107 | Saint Laurent Accessories Collection 7      | Accessories |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-OUT-108 | Saint Laurent Outerwear Collection 8        | Outerwear   |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-DRE-109 | Saint Laurent Dress Collection 9            | Dress       |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf B |
| Saint Laurent     | SAI-HAN-110 | Saint Laurent Handbag Collection 10         | Handbag     |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf B |
| Balenciaga        | BAL-ACC-101 | Balenciaga Accessories Collection 1         | Accessories |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-OUT-102 | Balenciaga Outerwear Collection 2           | Outerwear   |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-DRE-103 | Balenciaga Dress Collection 3               | Dress       |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-HAN-104 | Balenciaga Handbag Collection 4             | Handbag     |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-SHO-105 | Balenciaga Shoes Collection 5               | Shoes       |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-ACC-106 | Balenciaga Accessories Collection 6         | Accessories |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-OUT-107 | Balenciaga Outerwear Collection 7           | Outerwear   |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-DRE-108 | Balenciaga Dress Collection 8               | Dress       |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-HAN-109 | Balenciaga Handbag Collection 9             | Handbag     |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf C |
| Balenciaga        | BAL-SHO-110 | Balenciaga Shoes Collection 10              | Shoes       |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf C |
| Fendi             | FEN-OUT-101 | Fendi Outerwear Collection 1                | Outerwear   |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-DRE-102 | Fendi Dress Collection 2                    | Dress       |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-HAN-103 | Fendi Handbag Collection 3                  | Handbag     |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-SHO-104 | Fendi Shoes Collection 4                    | Shoes       |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-ACC-105 | Fendi Accessories Collection 5              | Accessories |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-OUT-106 | Fendi Outerwear Collection 6                | Outerwear   |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-DRE-107 | Fendi Dress Collection 7                    | Dress       |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-HAN-108 | Fendi Handbag Collection 8                  | Handbag     |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-SHO-109 | Fendi Shoes Collection 9                    | Shoes       |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf D |
| Fendi             | FEN-ACC-110 | Fendi Accessories Collection 10             | Accessories |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf D |
| Valentino         | VAL-DRE-101 | Valentino Dress Collection 1                | Dress       |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-HAN-102 | Valentino Handbag Collection 2              | Handbag     |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-SHO-103 | Valentino Shoes Collection 3                | Shoes       |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-ACC-104 | Valentino Accessories Collection 4          | Accessories |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-OUT-105 | Valentino Outerwear Collection 5            | Outerwear   |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-DRE-106 | Valentino Dress Collection 6                | Dress       |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-HAN-107 | Valentino Handbag Collection 7              | Handbag     |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-SHO-108 | Valentino Shoes Collection 8                | Shoes       |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-ACC-109 | Valentino Accessories Collection 9          | Accessories |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf E |
| Valentino         | VAL-OUT-110 | Valentino Outerwear Collection 10           | Outerwear   |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf E |
| Givenchy          | GIV-HAN-101 | Givenchy Handbag Collection 1               | Handbag     |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-SHO-102 | Givenchy Shoes Collection 2                 | Shoes       |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-ACC-103 | Givenchy Accessories Collection 3           | Accessories |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-OUT-104 | Givenchy Outerwear Collection 4             | Outerwear   |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-DRE-105 | Givenchy Dress Collection 5                 | Dress       |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-HAN-106 | Givenchy Handbag Collection 6               | Handbag     |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-SHO-107 | Givenchy Shoes Collection 7                 | Shoes       |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-ACC-108 | Givenchy Accessories Collection 8           | Accessories |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-OUT-109 | Givenchy Outerwear Collection 9             | Outerwear   |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf A |
| Givenchy          | GIV-DRE-110 | Givenchy Dress Collection 10                | Dress       |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf A |
| Celine            | CEL-SHO-101 | Celine Shoes Collection 1                   | Shoes       |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-ACC-102 | Celine Accessories Collection 2             | Accessories |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-OUT-103 | Celine Outerwear Collection 3               | Outerwear   |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-DRE-104 | Celine Dress Collection 4                   | Dress       |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-HAN-105 | Celine Handbag Collection 5                 | Handbag     |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-SHO-106 | Celine Shoes Collection 6                   | Shoes       |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-ACC-107 | Celine Accessories Collection 7             | Accessories |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-OUT-108 | Celine Outerwear Collection 8               | Outerwear   |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-DRE-109 | Celine Dress Collection 9                   | Dress       |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf B |
| Celine            | CEL-HAN-110 | Celine Handbag Collection 10                | Handbag     |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf B |
| Loewe             | LOE-ACC-101 | Loewe Accessories Collection 1              | Accessories |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-OUT-102 | Loewe Outerwear Collection 2                | Outerwear   |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-DRE-103 | Loewe Dress Collection 3                    | Dress       |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-HAN-104 | Loewe Handbag Collection 4                  | Handbag     |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-SHO-105 | Loewe Shoes Collection 5                    | Shoes       |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-ACC-106 | Loewe Accessories Collection 6              | Accessories |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-OUT-107 | Loewe Outerwear Collection 7                | Outerwear   |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-DRE-108 | Loewe Dress Collection 8                    | Dress       |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-HAN-109 | Loewe Handbag Collection 9                  | Handbag     |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf C |
| Loewe             | LOE-SHO-110 | Loewe Shoes Collection 10                   | Shoes       |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf C |
| Alexander McQueen | ALE-OUT-101 | Alexander McQueen Outerwear Collection 1    | Outerwear   |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-DRE-102 | Alexander McQueen Dress Collection 2        | Dress       |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-HAN-103 | Alexander McQueen Handbag Collection 3      | Handbag     |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-SHO-104 | Alexander McQueen Shoes Collection 4        | Shoes       |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-ACC-105 | Alexander McQueen Accessories Collection 5  | Accessories |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-OUT-106 | Alexander McQueen Outerwear Collection 6    | Outerwear   |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-DRE-107 | Alexander McQueen Dress Collection 7        | Dress       |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-HAN-108 | Alexander McQueen Handbag Collection 8      | Handbag     |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-SHO-109 | Alexander McQueen Shoes Collection 9        | Shoes       |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf D |
| Alexander McQueen | ALE-ACC-110 | Alexander McQueen Accessories Collection 10 | Accessories |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf D |
| Bottega Veneta    | BOT-DRE-101 | Bottega Veneta Dress Collection 1           | Dress       |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-HAN-102 | Bottega Veneta Handbag Collection 2         | Handbag     |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-SHO-103 | Bottega Veneta Shoes Collection 3           | Shoes       |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-ACC-104 | Bottega Veneta Accessories Collection 4     | Accessories |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-OUT-105 | Bottega Veneta Outerwear Collection 5       | Outerwear   |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-DRE-106 | Bottega Veneta Dress Collection 6           | Dress       |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-HAN-107 | Bottega Veneta Handbag Collection 7         | Handbag     |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-SHO-108 | Bottega Veneta Shoes Collection 8           | Shoes       |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-ACC-109 | Bottega Veneta Accessories Collection 9     | Accessories |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf E |
| Bottega Veneta    | BOT-OUT-110 | Bottega Veneta Outerwear Collection 10      | Outerwear   |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf E |
| Local Luxury A    | LOC-HAN-101 | Local Luxury A Handbag Collection 1         | Handbag     |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-SHO-102 | Local Luxury A Shoes Collection 2           | Shoes       |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-ACC-103 | Local Luxury A Accessories Collection 3     | Accessories |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-OUT-104 | Local Luxury A Outerwear Collection 4       | Outerwear   |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-DRE-105 | Local Luxury A Dress Collection 5           | Dress       |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-HAN-106 | Local Luxury A Handbag Collection 6         | Handbag     |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-SHO-107 | Local Luxury A Shoes Collection 7           | Shoes       |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-ACC-108 | Local Luxury A Accessories Collection 8     | Accessories |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-OUT-109 | Local Luxury A Outerwear Collection 9       | Outerwear   |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf A |
| Local Luxury A    | LOC-DRE-110 | Local Luxury A Dress Collection 10          | Dress       |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf A |
| Local Luxury B    | LOC-SHO-101 | Local Luxury B Shoes Collection 1           | Shoes       |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-ACC-102 | Local Luxury B Accessories Collection 2     | Accessories |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-OUT-103 | Local Luxury B Outerwear Collection 3       | Outerwear   |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-DRE-104 | Local Luxury B Dress Collection 4           | Dress       |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-HAN-105 | Local Luxury B Handbag Collection 5         | Handbag     |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-SHO-106 | Local Luxury B Shoes Collection 6           | Shoes       |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-ACC-107 | Local Luxury B Accessories Collection 7     | Accessories |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-OUT-108 | Local Luxury B Outerwear Collection 8       | Outerwear   |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-DRE-109 | Local Luxury B Dress Collection 9           | Dress       |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf B |
| Local Luxury B    | LOC-HAN-110 | Local Luxury B Handbag Collection 10        | Handbag     |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf B |
| Indie Designer X  | IND-ACC-101 | Indie Designer X Accessories Collection 1   | Accessories |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-OUT-102 | Indie Designer X Outerwear Collection 2     | Outerwear   |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-DRE-103 | Indie Designer X Dress Collection 3         | Dress       |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-HAN-104 | Indie Designer X Handbag Collection 4       | Handbag     |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-SHO-105 | Indie Designer X Shoes Collection 5         | Shoes       |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-ACC-106 | Indie Designer X Accessories Collection 6   | Accessories |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-OUT-107 | Indie Designer X Outerwear Collection 7     | Outerwear   |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-DRE-108 | Indie Designer X Dress Collection 8         | Dress       |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-HAN-109 | Indie Designer X Handbag Collection 9       | Handbag     |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf C |
| Indie Designer X  | IND-SHO-110 | Indie Designer X Shoes Collection 10        | Shoes       |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf C |
| Heritage Batik    | HER-OUT-101 | Heritage Batik Outerwear Collection 1       | Outerwear   |    10 |            1600000 |               2650000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-DRE-102 | Heritage Batik Dress Collection 2           | Dress       |    10 |            1700000 |               2800000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-HAN-103 | Heritage Batik Handbag Collection 3         | Handbag     |    10 |            1800000 |               2950000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-SHO-104 | Heritage Batik Shoes Collection 4           | Shoes       |    10 |            1900000 |               3100000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-ACC-105 | Heritage Batik Accessories Collection 5     | Accessories |    10 |            2000000 |               3250000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-OUT-106 | Heritage Batik Outerwear Collection 6       | Outerwear   |    10 |            2100000 |               3400000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-DRE-107 | Heritage Batik Dress Collection 7           | Dress       |    10 |            2200000 |               3550000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-HAN-108 | Heritage Batik Handbag Collection 8         | Handbag     |    10 |            2300000 |               3700000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-SHO-109 | Heritage Batik Shoes Collection 9           | Shoes       |    10 |            2400000 |               3850000 | Consignment | Main Store - Shelf D |
| Heritage Batik    | HER-ACC-110 | Heritage Batik Accessories Collection 10    | Accessories |    10 |            2500000 |               4000000 | Consignment | Main Store - Shelf D |
| Premium Silk Co   | PRE-DRE-101 | Premium Silk Co Dress Collection 1          | Dress       |    10 |            1600000 |               2650000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-HAN-102 | Premium Silk Co Handbag Collection 2        | Handbag     |    10 |            1700000 |               2800000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-SHO-103 | Premium Silk Co Shoes Collection 3          | Shoes       |    10 |            1800000 |               2950000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-ACC-104 | Premium Silk Co Accessories Collection 4    | Accessories |    10 |            1900000 |               3100000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-OUT-105 | Premium Silk Co Outerwear Collection 5      | Outerwear   |    10 |            2000000 |               3250000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-DRE-106 | Premium Silk Co Dress Collection 6          | Dress       |    10 |            2100000 |               3400000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-HAN-107 | Premium Silk Co Handbag Collection 7        | Handbag     |    10 |            2200000 |               3550000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-SHO-108 | Premium Silk Co Shoes Collection 8          | Shoes       |    10 |            2300000 |               3700000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-ACC-109 | Premium Silk Co Accessories Collection 9    | Accessories |    10 |            2400000 |               3850000 | Regular     | Main Store - Shelf E |
| Premium Silk Co   | PRE-OUT-110 | Premium Silk Co Outerwear Collection 10     | Outerwear   |    10 |            2500000 |               4000000 | Regular     | Main Store - Shelf E |