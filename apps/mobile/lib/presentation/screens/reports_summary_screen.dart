import 'package:flutter/material.dart';

class ReportsSummaryScreen extends StatelessWidget {
  const ReportsSummaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D9488),
        title: const Text('રિપોર્ટ્સ અને આંકડા (Executive Reports)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category 1: School Overview
            const Text('શાળા માહિતી રિપોર્ટ (School Stats)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            _buildReportCard([
              _buildReportItem(Icons.groups_rounded, 'વિદ્યાર્થી રજિસ્ટર (Student Strength)', '૪૪૦ કુલ નોંધાયેલ વિદ્યાર્થીઓ', Colors.blue),
              _buildReportItem(Icons.how_to_reg_rounded, 'માસિક સરેરાશ હાજરી', '૯૬.૨% સરેરાશ હાજરી દર', Colors.emerald),
              _buildReportItem(Icons.badge_rounded, 'સ્ટાફ અને શિક્ષકો', '૧૮ શિક્ષક • ૪ વહીવટી સ્ટાફ', Colors.indigo),
            ]),
            const SizedBox(height: 20),

            // Category 2: Fees Collection
            const Text('ફી વસૂલાત હિસાબ (Fee Summaries)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            _buildReportCard([
              _buildReportItem(Icons.price_check_rounded, 'ચાલુ શૈક્ષણિક વર્ષ કુલ ફી માંગણી', '₹૪૮,૪૦,૦૦૦ (કુલ)', Colors.purple),
              _buildReportItem(Icons.savings_rounded, 'આજ સુધી જમા થયેલ ફી', '₹૩૯,૨૫,૫૦૦ (૮૧.૧%)', Colors.green),
              _buildReportItem(Icons.error_outline_rounded, 'કુલ વસૂલવાની બાકી ફી', '₹૯,૧૪,૫૦૦ (૧૮.૯%)', Colors.red),
            ]),
            const SizedBox(height: 20),

            // Category 3: Accounts & Rojmel
            const Text('નાણાકીય અને રોજમેળ સારાંશ (Accounting & Rojmel)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            _buildReportCard([
              _buildReportItem(Icons.account_balance_wallet_rounded, 'આજની આખર રોકડ સિલક (Cash in Hand)', '₹૫૨,૩૪૦', Colors.amber.shade800),
              _buildReportItem(Icons.account_balance_rounded, 'બેંક સિલક (SBI & BOB)', '₹૧૨,૪૮,૯૦૦', Colors.blueGrey),
              _buildReportItem(Icons.receipt_long_rounded, 'ચાલુ માસના કુલ ખર્ચ વાઉચર', '૪૭ વાઉચર્સ (₹૩,૧૨,૫૦૦)', Colors.teal),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _buildReportCard(List<Widget> items) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: items,
      ),
    );
  }

  Widget _buildReportItem(IconData icon, String title, String subtitle, Color color) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: color, size: 22),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
      trailing: const Icon(Icons.chevron_right_rounded, size: 18, color: Colors.grey),
    );
  }
}
