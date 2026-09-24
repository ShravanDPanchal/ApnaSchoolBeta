import 'package:flutter/material.dart';

class StudentModel {
  final String id;
  final String grNumber;
  final String firstNameEn;
  final String lastNameEn;
  final String firstNameGu;
  final String lastNameGu;
  final String gender;
  final String? apaarId;
  final String? uDisePen;
  final String? fatherName;
  final String? motherName;
  final String? mobileNumber;
  final String? currentClass;
  final String? currentDivision;
  final int? rollNumber;
  final double feeOutstanding;

  StudentModel({
    required this.id,
    required this.grNumber,
    required this.firstNameEn,
    required this.lastNameEn,
    required this.firstNameGu,
    required this.lastNameGu,
    required this.gender,
    this.apaarId,
    this.uDisePen,
    this.fatherName,
    this.motherName,
    this.mobileNumber,
    this.currentClass,
    this.currentDivision,
    this.rollNumber,
    this.feeOutstanding = 0.0,
  });

  String get fullNameEn => '$firstNameEn $lastNameEn';
  String get fullNameGu => '$firstNameGu $lastNameGu';

  factory StudentModel.fromJson(Map<String, dynamic> json) {
    final enrollments = json['enrollments'] as List<dynamic>?;
    final currentEnrollment = (enrollments != null && enrollments.isNotEmpty) ? enrollments[0] : null;

    return StudentModel(
      id: json['id'] ?? '',
      grNumber: json['grNumber'] ?? json['gr'] ?? '',
      firstNameEn: json['firstNameEn'] ?? '',
      lastNameEn: json['lastNameEn'] ?? '',
      firstNameGu: json['firstNameGu'] ?? json['firstNameEn'] ?? '',
      lastNameGu: json['lastNameGu'] ?? json['lastNameEn'] ?? '',
      gender: json['gender'] ?? 'MALE',
      apaarId: json['apaarId'],
      uDisePen: json['uDisePen'],
      fatherName: json['fatherName'],
      motherName: json['motherName'],
      mobileNumber: json['mobileNumber'] ?? json['phone'],
      currentClass: currentEnrollment?['class']?['nameEn'] ?? json['class'],
      currentDivision: currentEnrollment?['division']?['nameEn'],
      rollNumber: currentEnrollment?['rollNumber'] ?? json['roll'],
      feeOutstanding: (json['feeOutstanding'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class DashboardStats {
  final int totalStudents;
  final int activeStudents;
  final int totalStaff;
  final int attendancePercentage;
  final double cashBalance;
  final double bankBalance;
  final double totalFeeCollected;
  final double outstandingFees;

  DashboardStats({
    required this.totalStudents,
    required this.activeStudents,
    required this.totalStaff,
    required this.attendancePercentage,
    required this.cashBalance,
    required this.bankBalance,
    required this.totalFeeCollected,
    required this.outstandingFees,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalStudents: json['totalStudents'] ?? 0,
      activeStudents: json['activeStudents'] ?? 0,
      totalStaff: json['totalStaff'] ?? 0,
      attendancePercentage: json['attendancePercentage'] ?? 95,
      cashBalance: (json['cashBalance'] as num?)?.toDouble() ?? 0.0,
      bankBalance: (json['bankBalance'] as num?)?.toDouble() ?? 0.0,
      totalFeeCollected: (json['totalFeeCollected'] as num?)?.toDouble() ?? 0.0,
      outstandingFees: (json['outstandingFees'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class NoticeModel {
  final String id;
  final String titleEn;
  final String titleGu;
  final String? bodyEn;
  final String? bodyGu;
  final String notificationType;
  final DateTime createdAt;

  NoticeModel({
    required this.id,
    required this.titleEn,
    required this.titleGu,
    this.bodyEn,
    this.bodyGu,
    required this.notificationType,
    required this.createdAt,
  });

  factory NoticeModel.fromJson(Map<String, dynamic> json) {
    return NoticeModel(
      id: json['id'] ?? '',
      titleEn: json['titleEn'] ?? '',
      titleGu: json['titleGu'] ?? json['titleEn'] ?? '',
      bodyEn: json['bodyEn'],
      bodyGu: json['bodyGu'] ?? json['bodyEn'],
      notificationType: json['notificationType'] ?? 'INFO',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
