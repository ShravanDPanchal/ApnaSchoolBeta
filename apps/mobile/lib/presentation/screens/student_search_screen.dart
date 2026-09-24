import 'package:flutter/material.dart';
import '../../data/models/models.dart';
import 'student_profile_screen.dart';

class StudentSearchScreen extends StatefulWidget {
  const StudentSearchScreen({super.key});

  @override
  State<StudentSearchScreen> createState() => _StudentSearchScreenState();
}

class _StudentSearchScreenState extends State<StudentSearchScreen> {
  String searchQuery = '';

  final List<StudentModel> sampleStudents = [
    StudentModel(
      id: 's1',
      grNumber: '1001',
      firstNameEn: 'Aarav',
      lastNameEn: 'Patel',
      firstNameGu: 'આરવ',
      lastNameGu: 'પટેલ',
      gender: 'MALE',
      fatherName: 'રાજેશભાઈ પટેલ',
      motherName: 'ગીતાબેન પટેલ',
      mobileNumber: '9825011223',
      apaarId: '123456781001',
      uDisePen: 'PEN-GJ-2026-1001',
      currentClass: 'ધોરણ ૫',
      currentDivision: 'અ',
      rollNumber: 1,
      feeOutstanding: 1200.0,
    ),
    StudentModel(
      id: 's2',
      grNumber: '1002',
      firstNameEn: 'Diya',
      lastNameEn: 'Shah',
      firstNameGu: 'દિયા',
      lastNameGu: 'શાહ',
      gender: 'FEMALE',
      fatherName: 'નિલેશભાઈ શાહ',
      motherName: 'અલ્પાબેન શાહ',
      mobileNumber: '9825044556',
      apaarId: '123456781002',
      uDisePen: 'PEN-GJ-2026-1002',
      currentClass: 'ધોરણ ૫',
      currentDivision: 'અ',
      rollNumber: 2,
      feeOutstanding: 0.0,
    ),
    StudentModel(
      id: 's3',
      grNumber: '1003',
      firstNameEn: 'Kabir',
      lastNameEn: 'Jadeja',
      firstNameGu: 'કબીર',
      lastNameGu: 'જાડેજા',
      gender: 'MALE',
      fatherName: 'યુવરાજસિંહ જાડેજા',
      motherName: 'વંદનાબા જાડેજા',
      mobileNumber: '9825077889',
      apaarId: '123456781003',
      uDisePen: 'PEN-GJ-2026-1003',
      currentClass: 'ધોરણ ૬',
      currentDivision: 'બ',
      rollNumber: 14,
      feeOutstanding: 3500.0,
    ),
    StudentModel(
      id: 's4',
      grNumber: '1004',
      firstNameEn: 'Ananya',
      lastNameEn: 'Mehta',
      firstNameGu: 'અનન્યા',
      lastNameGu: 'મહેતા',
      gender: 'FEMALE',
      fatherName: 'ભાવિનભાઈ મહેતા',
      motherName: 'રીનાબેન મહેતા',
      mobileNumber: '9825099001',
      apaarId: '123456781004',
      uDisePen: 'PEN-GJ-2026-1004',
      currentClass: 'ધોરણ ૭',
      currentDivision: 'અ',
      rollNumber: 8,
      feeOutstanding: 500.0,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final q = searchQuery.toLowerCase().trim();
    final filtered = sampleStudents.where((s) {
      if (q.isEmpty) return true;
      return s.fullNameEn.toLowerCase().contains(q) ||
          s.fullNameGu.toLowerCase().contains(q) ||
          s.grNumber.contains(q) ||
          (s.mobileNumber != null && s.mobileNumber!.contains(q)) ||
          (s.apaarId != null && s.apaarId!.contains(q));
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF007ED4),
        title: const Text('વિદ્યાર્થી શોધ (Student eGR)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            color: Colors.white,
            child: TextField(
              onChanged: (val) => setState(() => searchQuery = val),
              decoration: InputDecoration(
                hintText: 'નામ, GR નં, મોબાઈલ અથવા APAAR ID...',
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF007ED4)),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: filtered.isEmpty
                ? const Center(child: Text('કોઈ મેળ ખાતા વિદ્યાર્થી મળ્યા નથી'))
                : ListView.separated(
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final s = filtered[index];
                      return ListTile(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => StudentProfileScreen(student: s)),
                        ),
                        tileColor: Colors.white,
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFF007ED4).withOpacity(0.1),
                          child: Text(
                            s.grNumber,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF007ED4)),
                          ),
                        ),
                        title: Text(
                          '${s.fullNameGu} (${s.fullNameEn})',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        subtitle: Text(
                          '${s.currentClass ?? ""} ${s.currentDivision ?? ""} • રોલ: ${s.rollNumber ?? "-"} • પિતા: ${s.fatherName ?? "-"}',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            if (s.feeOutstanding > 0)
                              Text(
                                'બાકી: ₹${s.feeOutstanding.toInt()}',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red),
                              )
                            else
                              const Text(
                                'ફી ચૂકતે',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green),
                              ),
                            const Icon(Icons.chevron_right, size: 16, color: Colors.grey),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
