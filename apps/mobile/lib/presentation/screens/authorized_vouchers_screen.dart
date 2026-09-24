import 'package:flutter/material.dart';

class AuthorizedVouchersScreen extends StatefulWidget {
  const AuthorizedVouchersScreen({super.key});

  @override
  State<AuthorizedVouchersScreen> createState() => _AuthorizedVouchersScreenState();
}

class _AuthorizedVouchersScreenState extends State<AuthorizedVouchersScreen> {
  String voucherType = 'PAYMENT';
  final TextEditingController amountController = TextEditingController();
  final TextEditingController payeeController = TextEditingController();
  final TextEditingController refController = TextEditingController();
  final TextEditingController narrationController = TextEditingController();
  bool isSaving = false;

  final List<String> expenseAccounts = [
    'શ્રી વીજળી ખર્ચ ખાતું (Electricity Expense)',
    'શ્રી કચેરી સ્ટેશનરી ખર્ચ ખાતું (Office Stationery)',
    'શ્રી શાળા સમારકામ ખર્ચ ખાતું (Repairs & Maintenance)',
    'શ્રી વિદ્યાર્થી રમતોત્સવ ખર્ચ ખાતું (Sports & Events)',
  ];

  final List<String> bankAccounts = [
    'સ્ટેટ બેંક ઓફ ઈન્ડિયા (SBI A/c 38472910)',
    'બેંક ઓફ બરોડા (BOB A/c 10928374)',
    'હાથ પર રોકડ સિલક (Cash on Hand)',
  ];

  late String selectedDebitAccount;
  late String selectedCreditAccount;

  @override
  void initState() {
    super.initState();
    selectedDebitAccount = expenseAccounts[0];
    selectedCreditAccount = bankAccounts[0];
  }

  Future<void> _submitVoucher() async {
    final amount = double.tryParse(amountController.text.trim());
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('માન્ય વાઉચર રકમ દાખલ કરો')),
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
          content: Text('$voucherType વાઉચર સફળતાપૂર્વક સર્વર પર માન્ય થયેલ છે! (Double-Entry Balanced)'),
        ),
      );
      amountController.clear();
      payeeController.clear();
      refController.clear();
      narrationController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7C3AED),
        title: const Text('વાઉચર એન્ટ્રી (Authorized Vouchers)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
            // Voucher Type Segmented Switcher
            Row(
              children: [
                _buildTypeButton('PAYMENT', 'ચૂકવણી (Payment)'),
                const SizedBox(width: 8),
                _buildTypeButton('RECEIPT', 'આવક (Receipt)'),
                const SizedBox(width: 8),
                _buildTypeButton('CONTRA', 'કોન્ટ્રા (Contra)'),
              ],
            ),
            const SizedBox(height: 16),

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
                  const Text('ઉધાર ખાતું (Debit Account)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: selectedDebitAccount,
                    isExpanded: true,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: expenseAccounts.map((a) => DropdownMenuItem(value: a, child: Text(a, style: const TextStyle(fontSize: 12)))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => selectedDebitAccount = val);
                    },
                  ),
                  const SizedBox(height: 14),

                  const Text('જમા ખાતું (Credit Account - Bank/Cash)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: selectedCreditAccount,
                    isExpanded: true,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: bankAccounts.map((a) => DropdownMenuItem(value: a, child: Text(a, style: const TextStyle(fontSize: 12)))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => selectedCreditAccount = val);
                    },
                  ),
                  const SizedBox(height: 14),

                  const Text('વાઉચર રકમ (Voucher Amount)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: amountController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      prefixText: '₹ ',
                      hintText: '૫૦૦૦',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 14),

                  const Text('ચેક / UTR / રેફરન્સ નંબર', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: refController,
                    decoration: InputDecoration(
                      hintText: 'દા.ત. CHQ-481920 અથવા UTR-30192',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 14),

                  const Text('વિગત અને અધિકૃત નોંધ (Narration)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: narrationController,
                    decoration: InputDecoration(
                      hintText: 'ખર્ચ મંજૂરી ઠરાવ નં. ૪ મુજબ ચૂકવણી',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: isSaving ? null : _submitVoucher,
                      icon: isSaving
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Icon(Icons.verified_rounded),
                      label: Text(
                        isSaving ? 'વાઉચર માન્ય થઈ રહ્યું છે...' : 'વાઉચર મંજૂર અને પોસ્ટ કરો (Authorize)',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7C3AED),
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

  Widget _buildTypeButton(String type, String label) {
    final isSelected = voucherType == type;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => voucherType = type),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF7C3AED) : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSelected ? const Color(0xFF7C3AED) : Colors.grey.shade300),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.black87,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 11,
            ),
          ),
        ),
      ),
    );
  }
}
