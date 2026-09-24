import 'package:flutter/material.dart';
import '../../core/auth/auth_service.dart';
import 'login_screen.dart';
import 'fast_attendance_screen.dart';
import 'student_search_screen.dart';
import 'quick_rojmel_screen.dart';
import 'timetable_screen.dart';
import 'fee_info_screen.dart';
import 'authorized_vouchers_screen.dart';
import 'reports_summary_screen.dart';
import 'notices_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final user = AuthService().currentUser;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isTablet = width >= 600;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF007ED4),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              user?.tenantName ?? 'શ્રી સરસ્વતી વિદ્યા મંદિર',
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Text(
              '${user?.fullName ?? "વહીવટી સ્ટાફ"} • ${user?.role ?? "ADMIN"}',
              style: const TextStyle(color: Color(0xFFEEAA00), fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active_rounded, color: Colors.white),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NoticesScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white),
            onPressed: () async {
              await AuthService().logout();
              if (context.mounted) {
                Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: isTablet ? 24 : 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // KPI Summary Row
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'આજની હાજરી',
                    value: '૯૬.૫%',
                    subtitle: '૪૨૫ હાજર / ૧૫ ગેરહાજર',
                    color: Colors.emerald,
                    icon: Icons.how_to_reg_rounded,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    title: 'રોકડ સિલક',
                    value: '₹૫૨,૩૪૦',
                    subtitle: 'રોજમેળ હાથ પર રોકડ',
                    color: Colors.amber.shade700,
                    icon: Icons.account_balance_wallet_rounded,
                  ),
                ),
                if (isTablet) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      title: 'કુલ વિદ્યાર્થીઓ',
                      value: '૪૪૦',
                      subtitle: 'સક્રિય ધોરણ ૧ થી ૧૦',
                      color: Colors.blue.shade700,
                      icon: Icons.groups_rounded,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 24),

            const Text(
              'રોજિંદા મહત્વપૂર્ણ કાર્યો (Daily Actions)',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),

            // Responsive Grid / Action Tiles
            GridView.count(
              crossAxisCount: isTablet ? 3 : 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: isTablet ? 1.4 : 1.15,
              children: [
                _buildActionCard(
                  context,
                  title: 'ઝડપી હાજરી\n(Attendance)',
                  icon: Icons.checklist_rtl_rounded,
                  color: const Color(0xFF0284C7),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FastAttendanceScreen())),
                ),
                _buildActionCard(
                  context,
                  title: 'વિદ્યાર્થી શોધ\n(Student eGR)',
                  icon: Icons.person_search_rounded,
                  color: const Color(0xFF4F46E5),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentSearchScreen())),
                ),
                _buildActionCard(
                  context,
                  title: 'ઝડપી રોજમેળ\n(Quick Rojmel)',
                  icon: Icons.menu_book_rounded,
                  color: const Color(0xFFD97706),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QuickRojmelScreen())),
                ),
                _buildActionCard(
                  context,
                  title: 'સમયપત્રક\n(Timetable)',
                  icon: Icons.calendar_month_rounded,
                  color: const Color(0xFF059669),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TimetableScreen())),
                ),
                _buildActionCard(
                  context,
                  title: 'ફી માહિતી\n(Fee Info)',
                  icon: Icons.payments_rounded,
                  color: const Color(0xFFE11D48),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FeeInfoScreen())),
                ),
                _buildActionCard(
                  context,
                  title: 'વાઉચર એન્ટ્રી\n(Vouchers)',
                  icon: Icons.receipt_long_rounded,
                  color: const Color(0xFF7C3AED),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthorizedVouchersScreen())),
                ),
                _buildActionCard(
                  context,
                  title: 'રિપોર્ટ્સ કેન્દ્ર\n(Reports)',
                  icon: Icons.bar_chart_rounded,
                  color: const Color(0xFF0D9488),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportsSummaryScreen())),
                ),
                _buildActionCard(
                  context,
                  title: 'સૂચનાઓ\n(Notices)',
                  icon: Icons.campaign_rounded,
                  color: const Color(0xFFEA580C),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NoticesScreen())),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 26),
          const SizedBox(height: 10),
          Text(title, style: TextStyle(color: Colors.grey.shade600, fontSize: 11, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          Text(subtitle, style: TextStyle(color: Colors.grey.shade500, fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
                height: 1.25,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
