import 'package:flutter/foundation.dart';
import '../models/devhub_models.dart';
import '../services/devhub_api.dart';

class AuthState extends ChangeNotifier {
  final DevHubApi api;
  AuthState(this.api);
  DevUser? user;
  List<RepoItem> repos = [];
  List<Map<String,dynamic>> skills = [];
  bool loading = true;
  String? error;
  bool get isAuthenticated => user != null && api.hasToken;

  Future<void> restore() async {
    await api.init();
    if (api.hasToken) { try { await loadMe(); } catch (_) { await api.setToken(null); } }
    loading = false; notifyListeners();
  }
  Future<void> _accept(Map<String,dynamic> result) async {
    final token = result['token']?.toString();
    if (token != null) await api.setToken(token);
    await loadMe();
  }
  Future<void> login(String identifier,String password) async {
    loading=true; error=null; notifyListeners();
    try { await _accept(await api.login(identifier,password)); } catch(e){ error=e.toString(); rethrow; }
    finally { loading=false; notifyListeners(); }
  }
  Future<void> register(Map<String,dynamic> data) async {
    loading=true; error=null; notifyListeners();
    try { await _accept(await api.register(data)); } catch(e){ error=e.toString(); rethrow; }
    finally { loading=false; notifyListeners(); }
  }
  Future<void> demoLogin(String username) async {
    loading=true; error=null; notifyListeners();
    try { await _accept(await api.demoLogin(username)); } catch(e){ error=e.toString(); rethrow; }
    finally { loading=false; notifyListeners(); }
  }
  Future<void> loadMe() async {
    final data=await api.me();
    user=DevUser(Map<String,dynamic>.from(data['user'] ?? {}));
    repos=(data['repos'] as List? ?? []).map((e)=>RepoItem(Map<String,dynamic>.from(e))).toList();
    skills=(data['skills'] as List? ?? []).map((e)=>Map<String,dynamic>.from(e)).toList();
    notifyListeners();
  }
  Future<void> sync() async {
    final result=await api.sync();
    if(result['user'] is Map) user=DevUser(Map<String,dynamic>.from(result['user']));
    if(result['repos'] is List) repos=(result['repos'] as List).map((e)=>RepoItem(Map<String,dynamic>.from(e))).toList();
    if(result['skills'] is List) skills=(result['skills'] as List).map((e)=>Map<String,dynamic>.from(e)).toList();
    notifyListeners();
  }
  Future<void> updateProfile(Map<String,dynamic> data) async { await api.updateMe(data); await loadMe(); }
  Future<void> saveSkills(List<Map<String,dynamic>> value) async { await api.updateSkills(value); await loadMe(); }
  Future<void> signOut() async { await api.logout(); user=null; repos=[]; skills=[]; notifyListeners(); }
}
