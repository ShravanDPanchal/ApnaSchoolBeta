import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';

class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final String tenantId;
  final String tenantName;
  final List<String> permissions;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.tenantId,
    required this.tenantName,
    required this.permissions,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, Map<String, dynamic>? tenant) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? json['email'] ?? 'User',
      role: json['role'] ?? 'TEACHER',
      tenantId: tenant?['id'] ?? json['tenantId'] ?? '',
      tenantName: tenant?['name'] ?? 'Apna School',
      permissions: (json['permissions'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Dio _dio = ApiClient().dio;

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  Future<bool> login({
    required String identifier,
    required String password,
    String? tenantCode,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.login,
        data: {
          'identifier': identifier,
          'password': password,
          if (tenantCode != null && tenantCode.isNotEmpty) 'tenantCode': tenantCode,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        final token = data['token'];
        final userJson = data['user'];
        final tenantJson = data['tenant'];

        await _storage.write(key: 'apna_token', value: token);
        await _storage.write(key: 'apna_tenant_id', value: tenantJson?['id'] ?? '');

        _currentUser = UserModel.fromJson(userJson, tenantJson);
        return true;
      }
      return false;
    } on DioException catch (e) {
      debugPrint('Login failed: ${e.response?.data}');
      return false;
    } catch (e) {
      debugPrint('Login exception: $e');
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'apna_token');
    await _storage.delete(key: 'apna_tenant_id');
    _currentUser = null;
  }

  Future<bool> tryAutoLogin() async {
    final token = await _storage.read(key: 'apna_token');
    if (token == null || token.isEmpty) return false;

    try {
      final response = await _dio.get(ApiEndpoints.profile);
      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        _currentUser = UserModel.fromJson(data, data['tenant']);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
