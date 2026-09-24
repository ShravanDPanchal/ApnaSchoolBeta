import 'package:flutter/material.dart';

class QuickRojmelScreen extends StatefulWidget {
  const QuickRojmelScreen({super.key});

  @override
  State<QuickRojmelScreen> createState() => _QuickRojmelScreenState();
}

class _QuickRojmelScreenState extends State<QuickRojmelScreen> {
  bool isJama = true;
  String selectedHead = 'શ્રી શિક્ષણ ફી આવક ખાતું';
  final TextEditingController amountController = TextEditingController();
  final TextEditingController narrationController = TextEditingController();
  bool isSaving = false;

  final List<String> incomeHeads = [
    'શ્રી શિક્ષણ ફી આવક ખાતું',
    'શ્રી સંયુક્ત શાળા અનુદાન ગ્રાન્ટ',
    'શ્રી અન્ય પરચૂરણ આવક ખાતું',
    'શ્રી બેંક વ્યાજ આવક ખાતું',
  ];

  final List<String> expenseHeads = [
    'શ્રી છાપકામ અને સ્ટેશનરી ખર્ચ ખાતું',
    'શ્રી વીજળી બિલ ખર્ચ ખાતું',
    'શ્રી સ્ટાફ પગાર ખર્ચ ખાતું',
    'શ્રી બગીચા અને સફાઈ ખર્ચ ખાતું',
    'શ્રી સમારકામ અને જાળવણી ખર્ચ ખાતું',
  ];

  Future<void> _submitEntry() async {
    final amount = double.tryParse(amountController.text.trim());
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('માન્ય રકમ દાખલ કરો (Enter valid amount)')),
      );
      return;
    }

    setState(() => isSaving = true);
    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() => isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.green,
          content: Text(
            '${isJama ? "જમા (JAMA)" : "ઉધાર (UDHAR)"} એન્ટ્રી રોજમેળમાં નોંધાઈ ગઈ છે! (Entry Saved to Rojmel)',
          ),
        ),
      );
      amountController.clear();
      narrationController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.amber.shade700,
        title: const Text('ઝડપી રોજમેળ નોંધ (Quick Rojmel)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
            // Jama / Udhar Toggle
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() {
                      isJama = true;
                      selectedHead = incomeHeads[0];
                    }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        color: isJama ? Colors.green.shade50 : Colors.white,
                        border: Border.all(color: isJama ? Colors.green : Colors.grey.shade300, width: isJama ? 2 : 1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'જમા - આવક (JAMA)',
                        style: TextStyle(
                          color: isJama ? Colors.green.shade800 : Colors.grey.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() {
                      isJama = false;
                      selectedHead = expenseHeads[0];
                    }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        color: !isJama ? Colors.red.shade50 : Colors.white,
                        border: Border.all(color: !isJama ? Colors.red : Colors.grey.shade300, width: !isJama ? 2 : 1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'ઉધાર - જાવક (UDHAR)',
                        style: TextStyle(
                          color: !isJama ? Colors.red.shade800 : Colors.grey.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Form container
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ખાતાનું નામ (${isJama ? "આવક ખાતું" : "ખર્ચ ખાતું"})',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: selectedHead,
                    isExpanded: true,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: (isJama ? incomeHeads : expenseHeads)
                        .map((head) => DropdownMenuItem(value: head, child: Text(head, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => selectedHead = val);
                    },
                  ),
                  const SizedBox(height: 16),

                  const Text('રકમ (રૂપિયામાં)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: amountController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: 'દા.ત. ૨૫૦૦',
                      prefixText: '₹ ',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 16),

                  const Text('વિગત / ઓળખ નોંધ (Narration)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: narrationController,
                    decoration: InputDecoration(
                      hintText: 'દા.ત. કચેરી સ્ટેશનરી ખરીદી બિલ નં. ૧૨૪',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: isSaving ? null : _submitEntry,
                      icon: isSaving
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Icon(Icons.check_circle_rounded),
                      label: Text(
                        isSaving ? 'નોંધાઈ રહ્યું છે...' : 'રોજમેળમાં નોંધો (Save Entry)',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isJama ? Colors.green.shade700 : Colors.red.shade700,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
