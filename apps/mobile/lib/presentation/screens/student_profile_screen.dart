import 'package:flutter/material.dart';
import '../../data/models/models.dart';

class StudentProfileScreen extends StatelessWidget {
  final StudentModel student;

  const StudentProfileScreen({super.key, required this.student});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF007ED4),
        title: Text(student.fullNameGu, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
            // Header card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: const Color(0xFF007ED4).withOpacity(0.12),
                    child: Text(
                      student.firstNameGu.isNotEmpty ? student.firstNameGu[0] : 'S',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF007ED4)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          student.fullNameGu,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        Text(
                          student.fullNameEn,
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'GR નં: ${student.grNumber} • વર્ગ: ${student.currentClass ?? ""} ${student.currentDivision ?? ""}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF007ED4)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Statutory Identity Section
            const Text('સરકારી ઓળખ નંબરો (Statutory IDs)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            _buildDetailCard([
              _buildRow('APAAR ID (અપાર નં):', student.apaarId ?? 'નોંધાયેલ નથી'),
              _buildRow('UDISE+ PEN:', student.uDisePen ?? 'નોંધાયેલ નથી'),
              _buildRow('જાતિ (Gender):', student.gender == 'MALE' ? 'કુમાર (Male)' : 'કન્યા (Female)'),
            ]),
            const SizedBox(height: 16),

            // Parent & Contact Details
            const Text('વાલી અને સંપર્ક વિગત (Parents & Contact)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            _buildDetailCard([
              _buildRow('પિતાનું નામ:', student.fatherName ?? '-'),
              _buildRow('માતાનું નામ:', student.motherName ?? '-'),
              _buildRow('મોબાઈલ નંબર:', student.mobileNumber ?? '-'),
            ]),
            const SizedBox(height: 16),

            // Fee Status
            const Text('ફી હિસાબ સ્થિતિ (Fee Status)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            _buildDetailCard([
              _buildRow(
                'બાકી ફી રકમ:',
                student.feeOutstanding > 0 ? '₹${student.feeOutstanding.toInt()}' : 'રૂ. ૦ (સંપૂર્ણ ચૂકતે)',
                valueColor: student.feeOutstanding > 0 ? Colors.red : Colors.green,
              ),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailCard(List<Widget> rows) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: rows,
      ),
    );
  }

  Widget _buildRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
          Text(
            value,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: valueColor ?? const Color(0xFF0F172A)),
          ),
        ],
      ),
    );
  }
}
