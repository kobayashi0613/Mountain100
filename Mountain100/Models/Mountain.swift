import Foundation

/// 日本百名山の1座を表すモデル（mountain100.json の1エントリ）
struct Mountain: Identifiable, Codable, Hashable {
    let id: Int
    let name: String
    let kana: String
    let highestPeak: String?
    let elevationM: Int
    let prefectures: [String]
    let range: String

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case kana
        case highestPeak = "highest_peak"
        case elevationM = "elevation_m"
        case prefectures
        case range
    }

    /// 都道府県の表示用文字列（例: "長野県・岐阜県"）
    var prefecturesText: String {
        prefectures.joined(separator: "・")
    }

    /// 標高の表示用文字列（例: "3,180 m"）
    var elevationText: String {
        "\(elevationM.formatted()) m"
    }
}

/// mountain100.json 全体のデコード用
struct MountainDataset: Codable {
    let mountains: [Mountain]
}
