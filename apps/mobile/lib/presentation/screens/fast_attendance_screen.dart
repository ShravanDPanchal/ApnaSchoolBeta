import 'package:flutter/material.dart';

class FastAttendanceScreen extends StatefulWidget {
  const FastAttendanceScreen({super.key});

  @override
  State<FastAttendanceScreen> createState() => _FastAttendanceScreenState();
}

class _FastAttendanceScreenState extends State<FastAttendanceScreen> {
  String selectedClass = 'ધોરણ ૫ (Std 5)';
  String selectedDivision = 'અ (A)';
  bool isSaving = false;

  final List<Map<String, dynamic>> students = [
    {'roll': 1, 'name': 'આરવ રાજેશભાઈ પટેલ', 'gr': '1042', 'status': 'PRESENT'},
    {'roll': 2, 'name': 'દિયા નિલેશભાઈ શાહ', 'gr': '1043', 'status': 'PRESENT'},
    {'roll': 3, 'name': 'કબીર યુવરાજસિંહ જાડેજા', 'gr': '1044', 'status': 'ABSENT'},
    {'roll': 4, 'name': 'અનન્યા ભાવિનભાઈ મહેતા', 'gr': '1045', 'status': 'PRESENT'},
    {'roll': 5, 'name': 'દેવ રમેશભાઈ પ્રજાપતિ', 'gr': '1046', 'status': 'PRESENT'},
    {'roll': 6, 'name': 'કૃપા જિજ્ઞેશભાઈ વ્યાસ', 'gr': '1047', 'status': 'LEAVE'},
    {'roll': 7, 'name': 'ઓમ પ્રકાશભાઈ સોની', 'gr': '1048', 'status': 'PRESENT'},
    {'roll': 8, 'name': 'માનસી દિનેશભાઈ ચૌહાણ', 'gr': '1049', 'status': 'PRESENT'},
    {'roll': 9, 'name': 'હર્ષ વિપુલભાઈ પંચાલ', 'gr': '1050', 'status': 'PRESENT'},
    {'roll': 10, 'name': 'પ્રિયા અશોકભાઈ ત્રિવેદી', 'gr': '1051', 'status': 'PRESENT'},
  ];

  void _markAllPresent() {
    setState(() {
      for (var s in students) {
        s['status'] = 'PRESENT';
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('બધા વિદ્યાર્થીઓ હાજર તરીકે નોંધાયા')),
    );
  }

  void _toggleStatus(int index) {
    setState(() {
      final current = students[index]['status'];
      if (current == 'PRESENT') {
        students[index]['status'] = 'ABSENT';
      } else if (current == 'ABSENT') {
        students[index]['status'] = 'LEAVE';
      } else {
        students[index]['status'] = 'PRESENT';
      }
    });
  }

  Future<void> _submitAttendance() async {
    setState(() => isSaving = true);
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) {
      setState(() => isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.green,
          content: Text('હાજરી સર્વર પર સફળતાપૂર્વક સાચવાઈ ગઈ છે! (Saved to Backend)'),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final presentCount = students.where((s) => s['status'] == 'PRESENT').length;
    final absentCount = students.where((s) => s['status'] == 'ABSENT').length;
    final leaveCount = students.where((s) => s['status'] == 'LEAVE').length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF007ED4),
        title: const Text(
          'ઝડપી દૈનિક હાજરી (Fast Attendance)',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton.icon(
            onPressed: _markAllPresent,
            icon: const Icon(Icons.done_all_rounded, color: Colors.white, size: 18),
            label: const Text('બધા હાજર', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter / Class header bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF007ED4).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '$selectedClass - $selectedDivision',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF007ED4)),
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    _buildCountPill('હાજર', presentCount, Colors.emerald),
                    const SizedBox(width: 6),
                    _buildCountPill('ગેરહાજર', absentCount, Colors.red),
                    const SizedBox(width: 6),
                    _buildCountPill('રજા', leaveCount, Colors.amber.shade800),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Student List
          Expanded(
            child: ListView.separated(
              itemCount: students.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final s = students[index];
                final status = s['status'] as String;

                Color statusColor;
                String statusLabel;
                if (status == 'PRESENT') {
                  statusColor = Colors.emerald;
                  statusLabel = 'હાજર (P)';
                } else if (status == 'ABSENT') {
                  statusColor = Colors.red;
                  statusLabel = 'ગેરહાજર (A)';
                } else {
                  statusColor = Colors.amber.shade800;
                  statusLabel = 'રજા (L)';
                }

                return InkWell(
                  onTap: () => _toggleStatus(index),
                  child: Container(
                    color: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: Colors.grey.shade100,
                          child: Text(
                            '${s['roll']}',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                s['name'],
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              Text(
                                'GR: ${s['gr']}',
                                style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: statusColor, width: 1.2),
                          ),
                          child: Text(
                            statusLabel,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isSaving ? null : _submitAttendance,
                icon: isSaving
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.cloud_upload_rounded),
                label: Text(
                  isSaving ? 'સાચવી રહ્યા છીએ...' : 'હાજરી સબમિટ કરો (Submit Attendance)',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF007ED4),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountPill(String label, int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        '$label: $count',
        style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11),
      ),
    );
  }
}
