import 'package:flutter/material.dart';

class FeeInfoScreen extends StatefulWidget {
  const FeeInfoScreen({super.key});

  @override
  State<FeeInfoScreen> createState() => _FeeInfoScreenState();
}

class _FeeInfoScreenState extends State<FeeInfoScreen> {
  final TextEditingController _grController = TextEditingController(text: '1001');

  final List<Map<String, dynamic>> sampleInstallments = [
    {'term': 'પ્રથમ સત્ર ટ્યુશન ફી (Term 1)', 'amount': 4500, 'status': 'PAID', 'date': '૧૫-૦૭-૨૦૨૬', 'receipt': 'REC-2026-0042'},
    {'term': 'કોમ્પ્યુટર અને પ્રયોગશાળા ફી', 'amount': 1200, 'status': 'PAID', 'date': '૧૫-૦૭-૨૦૨૬', 'receipt': 'REC-2026-0043'},
    {'term': 'દ્વિતીય સત્ર ટ્યુશન ફી (Term 2)', 'amount': 4500, 'status': 'PENDING', 'date': 'બાકી (Due 30-11-2026)', 'receipt': '-'},
    {'term': 'વાર્ષિક પરીક્ષા અને પ્રવૃત્તિ ફી', 'amount': 800, 'status': 'PENDING', 'date': 'બાકી (Due 31-12-2026)', 'receipt': '-'},
  ];

  @override
  Widget build(BuildContext context) {
    const totalDemanded = 11000;
    const totalPaid = 5700;
    const totalDue = 5300;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF007ED4),
        title: const Text('વિદ્યાર્થી ફી વિગત (Student Fee)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
            // Student summary banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('આરવ રાજેશભાઈ પટેલ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Text('GR નં: 1001 • ધોરણ ૫ - અ (Roll 1)', style: TextStyle(color: Colors.grey, fontSize: 12)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.amber.shade400),
                        ),
                        child: Text(
                          'અંશતઃ ચૂકવેલ',
                          style: TextStyle(color: Colors.amber.shade800, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildSummaryItem('કુલ ફી', '₹$totalDemanded', Colors.black87),
                      _buildSummaryItem('ભરેલ ફી', '₹$totalPaid', Colors.green),
                      _buildSummaryItem('બાકી ફી', '₹$totalDue', Colors.red),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('હપ્તાવイズ હિસાબ (Installment Breakdown)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: sampleInstallments.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = sampleInstallments[index];
                final isPaid = item['status'] == 'PAID';

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isPaid ? Icons.check_circle_rounded : Icons.pending_rounded,
                        color: isPaid ? Colors.green : Colors.red,
                        size: 28,
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item['term'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(height: 2),
                            Text(
                              isPaid ? 'પહોંચ: ${item['receipt']} (${item['date']})' : item['date'],
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '₹${item['amount']}',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: isPaid ? Colors.green.shade800 : Colors.red.shade800,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}
