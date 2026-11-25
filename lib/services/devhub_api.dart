
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class DevHubApi {
  // Automatically select the correct default URL.
  static String get defaultBaseUrl {
    if (kIsWeb) return 'http://localhost:5001';

    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5001';
    }

    return 'http://localhost:5001';
  }

  static const _storage = FlutterSecureStorage();

  late String baseUrl;
  String? _token;
  late Future<void> _initFuture;

  DevHubApi() {
    baseUrl = defaultBaseUrl;
    _initFuture = init();
  }

  // Initialize stored authentication and API URL.
  Future<void> init() async {
    _token = await _storage.read(key: 'devhub_token');

    final storedUrl = await _storage.read(key: 'devhub_base_url');

    if (storedUrl != null && storedUrl.trim().isNotEmpty) {
      baseUrl = storedUrl.trim();
    }
  }

  Future<void> setBaseUrl(String url) async {
    baseUrl = url.trim();

    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    await _storage.write(
      key: 'devhub_base_url',
      value: baseUrl,
    );
  }

  Future<void> setToken(String? token) async {
    _token = token;

    if (token == null || token.isEmpty) {
      await _storage.delete(key: 'devhub_token');
    } else {
      await _storage.write(
        key: 'devhub_token',
        value: token,
      );
    }
  }

  bool get hasToken => _token != null && _token!.isNotEmpty;

  String? get token => _token;

  // Compatibility method.
  // Do not use this URL to download protected ZIP files.
  // Use downloadPortfolioZip() instead.
  Future<String> getExportZipUrl() async {
    await _initFuture;

    return '$baseUrl/api/portfolio/export';
  }

  // Common API request handler.
  Future<dynamic> _request(
      String method,
      String path, {
        Map<String, dynamic>? body,
        Map<String, String>? query,
      }) async {
    await _initFuture;

    final uri = Uri.parse('$baseUrl$path').replace(
      queryParameters: query,
    );

    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (hasToken) {
      headers['Authorization'] = 'Bearer $_token';
    }

    late http.Response response;

    try {
      switch (method) {
        case 'GET':
          response = await http
              .get(uri, headers: headers)
              .timeout(const Duration(seconds: 35));
          break;

        case 'POST':
          response = await http
              .post(
            uri,
            headers: headers,
            body: jsonEncode(body ?? {}),
          )
              .timeout(const Duration(seconds: 60));
          break;

        case 'PUT':
          response = await http
              .put(
            uri,
            headers: headers,
            body: jsonEncode(body ?? {}),
          )
              .timeout(const Duration(seconds: 35));
          break;

        case 'PATCH':
          response = await http
              .patch(
            uri,
            headers: headers,
            body: jsonEncode(body ?? {}),
          )
              .timeout(const Duration(seconds: 35));
          break;

        case 'DELETE':
          response = await http
              .delete(uri, headers: headers)
              .timeout(const Duration(seconds: 35));
          break;

        default:
          throw ApiException('Unsupported HTTP method');
      }
    } catch (e) {
      if (e is ApiException) rethrow;

      throw ApiException(
        'Cannot connect to DevHub API at $baseUrl. '
            'Check that your backend server is running and the API URL is correct.',
      );
    }

    dynamic decoded;

    try {
      decoded = response.body.isEmpty ? {} : jsonDecode(response.body);
    } catch (_) {
      decoded = {'message': response.body};
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        '${decoded is Map ? decoded['message'] ?? decoded['error'] ?? 'Request failed' : 'Request failed'}',
        response.statusCode,
      );
    }

    return decoded;
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  Future<Map<String, dynamic>> login(
      String identifier,
      String password,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'POST',
          '/auth/login',
          body: {
            'identifier': identifier,
            'password': password,
          },
        ),
      );

  Future<Map<String, dynamic>> fetchGitHubUser(
      String username,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'POST',
          '/auth/fetch-github-user',
          body: {'username': username},
        ),
      );

  Future<Map<String, dynamic>> register(
      Map<String, dynamic> data,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'POST',
          '/auth/register',
          body: data,
        ),
      );

  Future<Map<String, dynamic>> demoLogin(
      String username,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'POST',
          '/auth/demo-login',
          body: {'username': username},
        ),
      );

  Future<void> logout() async {
    try {
      await _request('POST', '/auth/logout');
    } finally {
      await setToken(null);
    }
  }

  // ==========================================
  // USER PROFILE
  // ==========================================

  Future<Map<String, dynamic>> me() async =>
      Map<String, dynamic>.from(
        await _request('GET', '/api/me'),
      );

  Future<Map<String, dynamic>> updateMe(
      Map<String, dynamic> data,
      ) async =>
      Map<String, dynamic>.from(
        await _request('PATCH', '/api/me', body: data),
      );

  Future<Map<String, dynamic>> sync() async =>
      Map<String, dynamic>.from(
        await _request('POST', '/api/sync'),
      );

  // ==========================================
  // DEVELOPER SEARCH AND MATCHING
  // ==========================================

  Future<Map<String, dynamic>> searchDevelopers({
    String q = '',
    String skill = '',
    String availability = '',
  }) async {
    final query = <String, String>{};

    if (q.isNotEmpty) query['q'] = q;
    if (skill.isNotEmpty) query['skill'] = skill;
    if (availability.isNotEmpty) {
      query['availability'] = availability;
    }

    return Map<String, dynamic>.from(
      await _request('GET', '/api/search', query: query),
    );
  }

  Future<Map<String, dynamic>> rankDevelopers(
      List<Map<String, dynamic>> required, {
        List<String> niceToHave = const [],
      }) async =>
      Map<String, dynamic>.from(
        await _request(
          'POST',
          '/api/match',
          body: {
            'required': required,
            'niceToHave': niceToHave,
            'limit': 15,
          },
        ),
      );

  // ==========================================
  // REPOSITORIES AND SKILLS
  // ==========================================

  Future<Map<String, dynamic>> updateRepo(
      String id,
      Map<String, dynamic> data,
      ) async =>
      Map<String, dynamic>.from(
        await _request('PATCH', '/api/repos/$id', body: data),
      );

  Future<Map<String, dynamic>> updateSkills(
      List<Map<String, dynamic>> skills,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'PUT',
          '/api/skills',
          body: {'skills': skills},
        ),
      );

  // ==========================================
  // COLLABORATION REQUESTS
  // ==========================================

  Future<Map<String, dynamic>> requests() async =>
      Map<String, dynamic>.from(
        await _request('GET', '/api/requests'),
      );

  Future<Map<String, dynamic>> sendRequest(
      Map<String, dynamic> data,
      ) async =>
      Map<String, dynamic>.from(
        await _request('POST', '/api/requests', body: data),
      );

  Future<Map<String, dynamic>> updateRequest(
      String id,
      String status,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'PATCH',
          '/api/requests/$id',
          body: {'status': status},
        ),
      );

  Future<void> cancelRequest(String id) async {
    await _request('DELETE', '/api/requests/$id');
  }

  // ==========================================
  // PROJECTS
  // ==========================================

  Future<Map<String, dynamic>> projects({
    String status = '',
  }) async =>
      Map<String, dynamic>.from(
        await _request(
          'GET',
          '/api/projects',
          query: status.isEmpty ? null : {'status': status},
        ),
      );

  Future<Map<String, dynamic>> createProject(
      Map<String, dynamic> data,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'POST',
          '/api/projects',
          body: data,
        ),
      );

  Future<Map<String, dynamic>> projectMatches(
      String id,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'GET',
          '/api/projects/$id/matches',
        ),
      );

  // ==========================================
  // PORTFOLIO
  // ==========================================

  Future<Map<String, dynamic>> portfolio() async =>
      Map<String, dynamic>.from(
        await _request('GET', '/api/portfolio'),
      );

  Future<Map<String, dynamic>> getGitHubBackground() async =>
      Map<String, dynamic>.from(
        await _request(
          'GET',
          '/api/portfolio/github-background',
        ),
      );

  Future<Map<String, dynamic>> savePortfolio(
      Map<String, dynamic> data,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'PUT',
          '/api/portfolio',
          body: data,
        ),
      );

  Future<Map<String, dynamic>> generatePortfolio(
      Map<String, dynamic> data,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'POST',
          '/api/portfolio/generate',
          body: data,
        ),
      );

  // ==========================================
  // PORTFOLIO ZIP DOWNLOAD
  // ==========================================

  Future<Uint8List> downloadPortfolioZip() async {
    await _initFuture;

    // Refresh token from secure storage if necessary.
    if (_token == null || _token!.isEmpty) {
      _token = await _storage.read(key: 'devhub_token');
    }

    if (!hasToken) {
      throw ApiException(
        'Authentication required. Please log in first.',
        401,
      );
    }

    final uri = Uri.parse(
      '$baseUrl/api/portfolio/export',
    );

    try {
      final response = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $_token',
          'Accept': 'application/zip',
        },
      ).timeout(const Duration(seconds: 60));

      if (response.statusCode < 200 ||
          response.statusCode >= 300) {
        String errorMessage = 'Portfolio ZIP download failed';

        try {
          final decoded = jsonDecode(
            utf8.decode(response.bodyBytes),
          );

          if (decoded is Map) {
            errorMessage = decoded['message'] ??
                decoded['error'] ??
                errorMessage;
          }
        } catch (_) {
          // Keep the default error message.
        }

        throw ApiException(
          errorMessage,
          response.statusCode,
        );
      }

      if (response.bodyBytes.isEmpty) {
        throw ApiException(
          'The server returned an empty ZIP file.',
        );
      }

      return response.bodyBytes;
    } catch (e) {
      if (e is ApiException) rethrow;

      throw ApiException(
        'Unable to download portfolio ZIP. Check your connection and try again.',
      );
    }
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  Future<Map<String, dynamic>> notifications() async =>
      Map<String, dynamic>.from(
        await _request('GET', '/api/notifications'),
      );

  Future<Map<String, dynamic>> markAllNotificationsRead() async =>
      Map<String, dynamic>.from(
        await _request(
          'PATCH',
          '/api/notifications/read-all',
        ),
      );

  // ==========================================
  // PUBLIC PROFILE
  // ==========================================

  Future<Map<String, dynamic>> publicProfile(
      String username,
      ) async =>
      Map<String, dynamic>.from(
        await _request(
          'GET',
          '/api/users/$username',
        ),
      );
}
